import { Test } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHealth: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    appService = moduleRef.get<AppService>(AppService);
    configService = moduleRef.get<ConfigService>(ConfigService);
    appController = moduleRef.get<AppController>(AppController);
  });

  describe('getHealth', () => {
    it('should return health status from AppService', async () => {
      const healthResult = {
        status: HttpStatus.OK,
        message: 'test server is running at 2023-01-01T12:00:00Z',
      };
      
      jest.spyOn(appService, 'getHealth').mockResolvedValue(healthResult);

      const result = await appController.getHealth();
      
      expect(appService.getHealth).toHaveBeenCalled();
      expect(result).toBe(healthResult);
    });
  });
});