import { HttpException, HttpStatus } from '@nestjs/common';

export type GenericResponse = {
  status: HttpStatus;
  message: string;
};

export function handleHttpException(error: HttpException): GenericResponse {
  const response = error.getResponse();
  if (typeof response === 'string') {
    return {
      status: error.getStatus(),
      message: error.getResponse().toString(),
    };
  } else {
    return error.getResponse() as GenericResponse;
  }
}

export async function rateLimitedMap(array, func, saveFunc, delay) {
  const results = [];
  for (const item of array) {
    const result = await func(item);
    results.push(result);
    await saveFunc(result);
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  return results;
}
