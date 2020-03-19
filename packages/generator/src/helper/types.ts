// tslint:disable: max-classes-per-file
export class CoffeeGeneratorError implements Error {
  public name: string = null;

  public message: string;

  constructor(message: string) {
    this.message = message;
  }
}

export class ArgumentError extends CoffeeGeneratorError {
  constructor(message: string) {
    super(message);
  }
}

export class ConfigurationError extends CoffeeGeneratorError {
  constructor(message: string) {
    super(message);
  }
}
