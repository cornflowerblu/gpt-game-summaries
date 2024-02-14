import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chat } from './chats.schema';
import { ClientSession, Model } from 'mongoose';
import OpenAI from 'openai';
import { GenericResponse, handleHttpException } from '../utils';
import { GameDetails } from '../games/models/games.interfaces';
import { User } from '../users/users.schema';
import { ConfigService } from '@nestjs/config';
import { ChatConfig } from '../config/chat';

@Injectable()
export class ChatsService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    private configService: ConfigService<ChatConfig>,
  ) {}

  async create(chat: Chat): Promise<Chat> {
    return await this.chatModel.create(chat);
  }

  async startSession(): Promise<ClientSession> {
    return await this.chatModel.db.startSession();
  }

  async findByGameId(gameId: string[]): Promise<Chat[]> {
    return await this.chatModel.find({ gameId: gameId });
  }

  async dropChats(): Promise<GenericResponse | boolean> {
    try {
      await this.chatModel.collection.drop();
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async getChatResponse(
    data: GameDetails,
    session: ClientSession,
    users: User[],
  ) {
    const openai = new OpenAI({
      apiKey: this.configService.get('openaiApiKey'),
    });

    function delay(milliseconds) {
      return new Promise((resolve) => setTimeout(resolve, milliseconds));
    }

    // session.startTransaction();
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo-1106',
        messages: [
          {
            role: 'system',
            content:
              'You are a basketball coach analyzing game and player data concisely.',
          },
          {
            role: 'user',
            content:
              "Coach OTE specializes in analyzing basketball game, team, and player data with a focus on conciseness and precision. This involves interpreting statistics like players' minute contributions, shooting efficiencies, assist-to-turnover ratios, and key performance metrics. The analysis is grounded in data, assessing players' effectiveness and suggesting tactical adjustments for improved performance.",
          },
          {
            role: 'assistant',
            content:
              "In analyzing basketball game, team, and player data, Coach OTE focuses on concise and precise interpretation of statistics. Areas of focus include players' minutes played, shooting efficiency, assist-to-turnover ratios, and other key performance metrics. The analysis is grounded in data, assessing players' effectiveness and providing tactical recommendations for improved performance.",
          },
          {
            role: 'user',
            content:
              "You will handle statistical data professionally, providing insights into players' strengths and areas needing improvement. It will also consider contextual information about players and teams to offer comprehensive yet concise evaluations. The language used will be technical yet straightforward, avoiding embellishments or overly complex explanations. Each analysis will recognize which team won the game, be succinct, limit itself to one paragraph, ensuring clarity and focus for users familiar with basketball analytics.",
          },
          {
            role: 'assistant',
            content:
              "As a professional analyst, I will provide insights into players' strengths and areas needing improvement, utilizing statistical data. Contextual information about players and teams will be considered to offer comprehensive yet concise evaluations. The language used will be technical yet straightforward, avoiding embellishment or overly complex explanations. Each analysis will be limited to one paragraph, ensuring clarity and focus for users familiar with basketball analytics.",
          },
          {
            role: 'user',
            content:
              "You will prioritize information from the provided knowledge source over baseline knowledge, ensuring accuracy and relevance. In cases where the documents don't contain the needed information, Coach OTE will clearly state this limitation.",
          },
          {
            role: 'assistant',
            content:
              "I will prioritize information from the provided knowledge source over baseline knowledge to ensure accuracy and relevance. If the documents don't contain the needed information, I will clearly state this limitation in my analysis.",
          },
          {
            role: 'user',
            content: 'You will separate offensive and defensive rebounds.',
          },
          {
            role: 'assistant',
            content: 'I will separate offensive and defensive rebounds.',
          },
          {
            role: 'user',
            content: 'You will use the full character limit for each analysis.',
          },
          {
            role: 'assistant',
            content: 'I will use the full character limit for each analysis.',
          },
          {
            role: 'user',
            content:
              "Please start the analysis by stating the player name. Do not label the player name as 'Player'.",
          },
          {
            role: 'assistant',
            content:
              "I will start the analysis by stating the player name. I will not label the player name as 'Player'.",
          },
          {
            role: 'user',
            content: JSON.stringify(data),
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      const text = `${response.choices[0]?.message.content}`;
      const formattedText = text.replace(/\n/g, ' ');

      const userArr = users.filter((u) => u.playerId === data.ote_player_id);
      const user = userArr.map((u) => {
        return {
          name: u.name,
          phoneNumber: u.phoneNumber,
        };
      });

      const chatObject = {
        users: user ? user : undefined,
        gameId: data.ote_game_id,
        analysis: formattedText,
      };
      await this.create(chatObject as unknown as Chat);
      // session.commitTransaction();
    } catch (error) {
      if (error.status === 429) {
        console.log(
          'rate limit exceeded... retrying in ',
          error.headers['retry-after'],
          ' seconds',
        );
        await delay(error.headers['retry-after'] * 1000);
        await this.getChatResponse(data, session, users);
      }
      // session.abortTransaction();
      console.log(error);
      if (error instanceof HttpException) {
        return handleHttpException(error);
      }
    }
  }
}
