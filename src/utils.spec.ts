import { HttpException, HttpStatus } from '@nestjs/common';
import { handleHttpException, rateLimitedMap } from './utils';

describe('Utils', () => {
  describe('handleHttpException', () => {
    it('should handle HttpException with string response', () => {
      const error = new HttpException('Test error message', HttpStatus.BAD_REQUEST);
      
      const result = handleHttpException(error);
      
      expect(result).toEqual({
        status: HttpStatus.BAD_REQUEST,
        message: 'Test error message',
      });
    });

    it('should handle HttpException with object response', () => {
      const errorResponse = {
        status: HttpStatus.FORBIDDEN,
        message: 'Access denied',
      };
      
      const error = new HttpException(errorResponse, HttpStatus.FORBIDDEN);
      
      const result = handleHttpException(error);
      
      expect(result).toEqual(errorResponse);
    });
  });

  describe('rateLimitedMap', () => {
    it('should process items with delay and save results', async () => {
      // Mock functions
      const mockFunc = jest.fn().mockImplementation(item => `processed-${item}`);
      const mockSaveFunc = jest.fn();
      
      // Mock implementation of rateLimitedMap that doesn't use real timeouts
      jest.spyOn(global, 'setTimeout').mockImplementation((callback) => {
        callback();
        return {} as any;
      });
      
      // Execute the function
      const results = await rateLimitedMap(['a', 'b', 'c'], mockFunc, mockSaveFunc, 1000);
      
      // Verify results
      expect(results).toEqual(['processed-a', 'processed-b', 'processed-c']);
      
      // Verify function calls
      expect(mockFunc).toHaveBeenCalledTimes(3);
      expect(mockFunc).toHaveBeenCalledWith('a');
      expect(mockFunc).toHaveBeenCalledWith('b');
      expect(mockFunc).toHaveBeenCalledWith('c');
      
      // Verify save function calls
      expect(mockSaveFunc).toHaveBeenCalledTimes(3);
      expect(mockSaveFunc).toHaveBeenCalledWith('processed-a');
      expect(mockSaveFunc).toHaveBeenCalledWith('processed-b');
      expect(mockSaveFunc).toHaveBeenCalledWith('processed-c');
      
      // Restore the original setTimeout
      jest.spyOn(global, 'setTimeout').mockRestore();
    }, 10000);
  });
});