#!/usr/bin/env node
import {
  CoffeeGeneratorError,
  componentProcessedSubject,
  ComponentStatus,
  generate,
  RepoFile,
  Subscriber,
} from '@coffeeit/generator';
import * as AsyncLock from 'async-lock';

import { GenerateCommand } from '../index.typings';
import { printError, printInfo, printSuccess, printTitle, printWarning, promptUser } from '../interaction';

const lock = new AsyncLock();

componentProcessedSubject.subscribe(new Subscriber(onComponentProcessed));

const yesToAll: string[] = [];

const overview = {
  [ComponentStatus.SUCCESS]: [],
  [ComponentStatus.SKIPPED]: [],
  [ComponentStatus.NOT_FOUND]: [],
};

export async function onGenerate(argv: GenerateCommand): Promise<void> {
  const { platform, components, outputFolder } = { ...argv };
  printTitle();

  try {
    if (!platform || components.length < 1) {
      return printError('Required arguments missing or incorrrect. Run with \'-h\' for help');
    }
    printInfo('Adding components...');

    await generate(onOverwriteWarn, platform, components, outputFolder);

    showOverview();
  } catch (err) {
    if (err instanceof CoffeeGeneratorError) {
      printError(err.message);
    } else {
      throw err;
    }
  }
}

function onComponentProcessed(
  platform: string,
  component: string,
  status: ComponentStatus): void {
  overview[status].push(component);
}

async function onOverwriteWarn(fileEntry: RepoFile, component: string): Promise<boolean> {
  return await lock.acquire('prompt', async () => {
    if (yesToAll.includes(component)) return true;
    const question = `File '${fileEntry.name}' is already present in component '${component}', Overwrite it? (y/n/yta) => `;
    const answer = await promptUser(question);

    const lowerCaseAnswer = answer.toLowerCase();

    switch (lowerCaseAnswer) {
      case 'y':
        return true;
      case 'yta':
        yesToAll.push(component);
        return true;
      case 'n':
      default:
        return false;
    }
  });
}

function showOverview(): void {
  overview[ComponentStatus.SUCCESS].forEach(component => printSuccess(`Component '${component}' added successfully!`));
  overview[ComponentStatus.SKIPPED].forEach(component => printWarning(`Skipped component '${component}'`));
  overview[ComponentStatus.NOT_FOUND].forEach(component => printError(`Failed to add component '${component}', component not found in given platform`));
}
