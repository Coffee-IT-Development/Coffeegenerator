import { CoffeeGeneratorError } from '../../types';

export class TokenError extends CoffeeGeneratorError {
  constructor(message: string) {
    super(message);
  }
}
