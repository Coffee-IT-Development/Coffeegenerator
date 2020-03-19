#!/usr/bin/env node
// tslint:disable: no-unused-expression
import {
  authenticationStartSubject,
  authenticationSuccessSubject,
  CoffeeGeneratorError,
  shouldOpenBrowser,
  Subscriber,
} from '@coffeeit/generator';
import * as yargs from 'yargs';

import { onGenerate } from './command/generate';
import { onList } from './command/list';
import { onLogout } from './command/logout';
import { initializeAPI, resetConfiguration } from './configure';
import { openBrowser, printAnything, printError, printSuccess, printWarning } from './interaction';

setup();

async function setup(): Promise<void> {
  try {
    registerResetCommand();
    subscribeToEvents();
    await initializeAPI();
    registerCLICommands();
  } catch (err) {
    if (err instanceof CoffeeGeneratorError) {
      printError(err.message);
    } else {
      printAnything(err);
    }
  }
}

function subscribeToEvents(): void {
  shouldOpenBrowser.subscribe(new Subscriber(url => openBrowser(url)));
  authenticationStartSubject.subscribe(new Subscriber(onAuthenticationStart));
  authenticationSuccessSubject.subscribe(new Subscriber(onAuthenticationSuccess));
}

function registerResetCommand(): void {
  yargs.command('config', 'Reconfigures the application', resetConfiguration).argv;
}

function registerCLICommands(): void {
  yargs.command(['generate <platform> <components...>', 'gen <platform> <components...>', 'g <platform> <components...>'], 'Generates one or more components',
    (argv) => {
      argv.positional('platform', {
        description: 'Platform you want to generate components for',
        type: 'string',
      });
      argv.positional('components', {
        description: 'Components you want to generate',
        type: 'string',
      });
      argv.options({
        'output-folder': {
          alias: 'o',
          description: 'Output folder, where you want the component to be placed. Current working dir will be used if not provided',
          type: 'string',
        },
      });
    }, onGenerate)
    .command(['list [platform]', 'l [platform]'], 'Lists available platforms & components',
      (argv) => {
        argv.positional('platform', {
          description: 'Platform you want to list components for',
          type: 'string',
        });
      }, onList)
    .command('logout', 'Removes all saved GitLab tokens', onLogout)
    .help()
    .version()
    .demandCommand()
    .recommendCommands()
    .alias('help', 'h')
    .argv;
}

function onAuthenticationStart(): void {
  printWarning('Authentication required!');
  printWarning('Go to you browser to give this app access to your GitLab account');
}

function onAuthenticationSuccess(): void {
  printSuccess('Successfully logged in!');
}
