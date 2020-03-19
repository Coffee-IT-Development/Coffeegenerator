import { CoffeeGeneratorError } from '../../types';

export enum HttpErrorCode {
  NO_CONNECTION, NOT_AUTHORIZED, OTHER, INVALID_BODY, NOT_FOUND,
}

// tslint:disable: max-classes-per-file
export class HttpError extends CoffeeGeneratorError {
  public code: HttpErrorCode;

  constructor(message: string, code: HttpErrorCode) {
    super(message);
    this.code = code;
  }
}

export class AccessDeniedError extends CoffeeGeneratorError {
  constructor(message: string) {
    super(message);
  }
}

export class SecurityError extends CoffeeGeneratorError {
  constructor(message: string) {
    super(message);
  }
}
