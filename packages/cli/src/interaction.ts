// tslint:disable: no-console
import { Repo } from '@coffeeit/generator';
import * as AsyncLock from 'async-lock';
import * as colors from 'colors';
import * as open from 'open';
import * as readline from 'readline';

const colorPool = [
  colors.magenta,
  colors.cyan,
  colors.yellow,
];

export function printTitle(): void {
  console.info(colors.blue.bold('Coffee IT component repository'));
}

export function printError(message: string): void {
  console.error(`${colors.bgRed.white('Error!')} ${message}`);
}

export function printAnything(content: any): void {
  console.debug(content);
}

export function printWarning(message: string): void {
  console.warn(`${colors.yellow('Warning')}: ${message}`);
}

export function printInfo(message: string): void {
  console.info(`${colors.cyan('Info')}: ${message}`);
}

export function printSuccess(message: string): void {
  console.info(`${colors.green('Success')}: ${message}`);
}

export function printList(listOfItems: string[]): void {
  listOfItems.forEach((element) => {
    console.info(`${colors.green('-')} ${element}`);
  });
}

export function printComponentsOverview(repositories: Repo[]): void {
  repositories.forEach((repo) => {
    const randomNum = Math.floor(Math.random() * Math.floor(colorPool.length - 1));
    const currentColor = colorPool[randomNum];

    console.info(`${currentColor(repo.name)}:`);
    repo.components.length > 0
      ? repo.components.forEach(file => console.info(currentColor(' #'), file.name))
      : console.info(currentColor(' X'), 'No components available');
  });
}

export function promptUser(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question(`${colors.yellow('Warning')}: ${question}`, (answer: string) => {
      rl.close();
      resolve(answer);
    });
  });
}

export async function openBrowser(url: string): Promise<void> {
  await open(url);
}
