import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

describe('AppService', () => {
  let service: AppService;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<AppService>(AppService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health status with environment from config', async () => {
      // Mock the date for consistent testing
      const mockDate = new Date('2023-01-01T12:00:00Z');
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const result = await service.getHealth();
      
      expect(configService.get).toHaveBeenCalledWith('environment');
      expect(result).toEqual({
        status: HttpStatus.OK,
        message: `test server is running' at ${mockDate.toISOString()}`,
      });
      
      // Restore Date
      jest.restoreAllMocks();
    });
  });
});