// Add type definitions for mock data and responses
interface OtePlayer {
  id: string;
  full_name: string;
  jersey_number: string;
  ote_team: {
    name: string;
  };
  is_current: boolean;
}

interface PlayerDocument {
  _id?: string | undefined;
  name: string;
  number: string;
  team: string;
  playerId: string;
}

interface ApiResponse {
  ote_players: OtePlayer[];
}

// Type the mock implementations
const mockPlayerModel = {
  find: jest.fn<any, any[]>(),
  findByIdAndUpdate: jest.fn<any, any[]>(),
  insertMany: jest.fn<Promise<PlayerDocument[]>, [PlayerDocument[]]>(),
  exec: jest.fn<any, any[]>(),
};

// Type the mock data
const mockPlayers: PlayerDocument[] = [
  {
    _id: '1',
    name: 'Player 1',
    number: '10',
    team: 'Team A',
    playerId: '101',
  },
  {
    _id: '2',
    name: 'Player 2',
    number: '20',
    team: 'Team B',
    playerId: '102',
  },
];

const mockOtePlayers: OtePlayer[] = [
  {
    id: '101',
    full_name: 'Player 1',
    jersey_number: '10',
    ote_team: { name: 'Team A' },
    is_current: true,
  },
  {
    id: '102',
    full_name: 'Player 2',
    jersey_number: '20',
    ote_team: { name: 'Team B' },
    is_current: true,
  },
  {
    id: '103',
    full_name: 'Player 3',
    jersey_number: '30',
    ote_team: { name: 'Team C' },
    is_current: true,
  },
  {
    id: '104',
    full_name: 'Player 4',
    jersey_number: '40',
    ote_team: { name: 'Team D' },
    is_current: false,
  },
];

// Type the fetch mock
declare global {
  interface Window {
    fetch: jest.Mock;
  }
}

// Add proper typing for the fetch mock
(global as any).fetch = jest.fn<
  Promise<{ json: () => Promise<ApiResponse> }>,
  [string, RequestInit]
>();

// Improve model typing
let model: Model<Player>;

import { PlayersService } from './players.service';
import { getModelToken } from '@nestjs/mongoose';
import { Player } from './players.schema';
import { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { TestingModule } from '@nestjs/testing/testing-module';
import { Test } from '@nestjs/testing';



describe('PlayersService', () => {
  let service: PlayersService;
  
  let model: Model<Player>;
 

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getModelToken(Player.name),
          useValue: mockPlayerModel,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    model = module.get<Model<Player>>(getModelToken(Player.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });



  describe('fetchAll', () => {
    it('should handle API errors gracefully', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('API Error'));
  
      await expect(service.fetchAll()).rejects.toThrow('API Error');
    });
  
    it('should handle invalid API responses', async () => {
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ invalid_data: [] }),
        }),
      );
  
      await expect(service.fetchAll()).rejects.toThrow();
    });

    it('should fetch and filter current players', async () => {
      // Mock the fetch API
      global.fetch = jest.fn().mockImplementation(() =>
        Promise.resolve({
          json: () => Promise.resolve({ ote_players: mockOtePlayers }),
        }),
      );

      const result = await service.fetchAll();

      expect(fetch).toHaveBeenCalledWith(
        'https://api.itsovertime.com/api/ote_players/v1/public',
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      expect(result.length).toBe(3); // Only current players
      expect(result).toEqual(mockOtePlayers.filter(p => p.is_current === true));
    });
  });

  describe('mapPlayers', () => {
    // Define type-safe mock data
    const mappedPlayers: PlayerDocument[] = [
      {
        _id: '1',
        name: 'Player 1',
        number: '10',
        team: 'Team A',
        playerId: '101',
      },
      {
        _id: '2',
        name: 'Player 2',
        number: '20',
        team: 'Team B',
        playerId: '102',
      }
    ];
  
    beforeEach(() => {
      // Reset mocks before each test
      jest.clearAllMocks();
    });
  
    it('should correctly map OTE players to Player schema format', async () => {
      // Setup mock for fetchAll
      jest.spyOn(service, 'fetchAll').mockResolvedValue(
        mockOtePlayers.filter(p => p.is_current === true)
      );
      
      // Setup mock for database query
      mockPlayerModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mappedPlayers)
      });
  
      const result = await service.mapPlayers();
  
      // Verify the mapping
      expect(result).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: mappedPlayers[0].name,
            number: mappedPlayers[0].number,
            team: mappedPlayers[0].team,
            playerId: mappedPlayers[0].playerId,
          })
        ])
      );
    });
  
    it('should handle empty response', async () => {
      jest.spyOn(service, 'fetchAll').mockResolvedValue([]);
      mockPlayerModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });
  
      const result = await service.mapPlayers();
      expect(result).toEqual([]);
    });
  
    it('should handle partial data', async () => {
      const partialPlayer: OtePlayer = {
        id: '103',
        full_name: 'Player 3',
        jersey_number: undefined,
        ote_team: { name: undefined },
        is_current: true
      };
  
      jest.spyOn(service, 'fetchAll').mockResolvedValue([partialPlayer]);
      mockPlayerModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([])
      });
      
      const result = await service.mapPlayers();
      
      expect(result[0]).toEqual({
        _id: undefined,
        playerId: '103',
        name: 'Player 3',
        number: undefined,
        team: undefined
      });
    });
  
    it('should maintain data integrity during mapping', async () => {
      const testPlayer: OtePlayer = {
        id: '104',
        full_name: 'Test Player',
        jersey_number: '99',
        ote_team: { name: 'Test Team' },
        is_current: true
      };
  
      jest.spyOn(service, 'fetchAll').mockResolvedValue([testPlayer]);
      
      const result = await service.mapPlayers();
      
      expect(result[0]).toMatchObject({
        playerId: testPlayer.id,
        name: testPlayer.full_name,
        number: testPlayer.jersey_number,
        team: testPlayer.ote_team.name
      });
    });
  
    it('should handle concurrent mapping operations', async () => {
      const multiplePromises = Array(3).fill(null).map(() => service.mapPlayers());
      
      jest.spyOn(service, 'fetchAll').mockResolvedValue(
        mockOtePlayers.filter(p => p.is_current === true)
      );
  
      await expect(Promise.all(multiplePromises)).resolves.not.toThrow();
    });
  
    it('should handle mapping errors gracefully', async () => {
      jest.spyOn(service, 'fetchAll').mockRejectedValue(new Error('Mapping error'));
  
      await expect(service.mapPlayers()).rejects.toThrow('Mapping error');
    });
  
    it('should preserve existing IDs during mapping', async () => {
      const existingPlayer = {
        _id: 'existing-id',
        playerId: '105',
        name: 'Existing Player',
        number: '55',
        team: 'Existing Team'
      };
  
      mockPlayerModel.find.mockReturnValue({
        exec: jest.fn().mockResolvedValue([existingPlayer])
      });
  
      jest.spyOn(service, 'fetchAll').mockResolvedValue([{
        id: '105',
        full_name: 'Updated Name',
        jersey_number: '56',
        ote_team: { name: 'New Team' },
        is_current: true
      }]);
  
      const result = await service.mapPlayers();
      
      expect(result[0]._id).toBe('existing-id');
    });
  });
  
});