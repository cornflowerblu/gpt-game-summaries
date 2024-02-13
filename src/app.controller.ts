import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { firstValueFrom, catchError } from 'rxjs';
// import { AxiosError } from 'axios';
// import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { WorkerConfig } from './config/worker';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    // private emmiter: EventEmitter2,
    // private httpService: HttpService,
    private configService: ConfigService<WorkerConfig>,
  ) {}

  @Get('health')
  async getHealth(): Promise<Record<string, unknown>> {
    // this.emmiter.emit('test', { test: 'test' });
    return await this.appService.getHealth();
  }

  // @Post('trigger')
  // async trigger() {
  //   const { data } = await firstValueFrom(
  //     this.httpService
  //       .post(this.configService.get('analysisUrl'), {
  //         headers: {
  //           'x-api-key': this.configService.get('apiKey'),
  //         },
  //       })
  //       .pipe(
  //         catchError((error: AxiosError) => {
  //           console.error(error.response.data);
  //           throw 'An error happened!';
  //         }),
  //       ),
  //   );

  //   console.log(data);
  //   return data;
  // }
}
