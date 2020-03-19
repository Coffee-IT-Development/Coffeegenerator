// tslint:disable: max-classes-per-file
import { ComponentStatus } from '../file/types';
import { Subscriber } from './Subscriber';

abstract class Subject {
  protected subscribers: Subscriber[] = [];

  public subscribe(obs: Subscriber): void {
    this.subscribers.push(obs);
  }

  public unsubscribe(obs: Subscriber): void {
    this.subscribers.splice(this.subscribers.indexOf(obs), 1);
  }
}

export class BaseSubject extends Subject {
  public notify(): void {
    this.subscribers.forEach((obs: Subscriber) => {
      obs.notify();
    });
  }
}

export class ComponentProcessedSubject extends Subject {
  public notify(platform: string, component: string, status: ComponentStatus): void {
    this.subscribers.forEach((obs: Subscriber) => {
      obs.notify(platform, component, status);
    });
  }
}

export class ShouldOpenBrowserSubject extends Subject {
  public notify(url: string): void {
    this.subscribers.forEach((obs: Subscriber) => {
      obs.notify(url);
    });
  }
}
