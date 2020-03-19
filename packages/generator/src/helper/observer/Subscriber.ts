export class Subscriber {
  private callback: (...args: any) => void;

  constructor(callback: (...args: any) => void) {
    this.callback = callback;
  }

  public notify(...args: any): void {
    this.callback(...args);
  }
}
