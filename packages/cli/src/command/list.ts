#!/usr/bin/env node
import { CoffeeGeneratorError, getAllAvailableComponents, getAvailableComponentsForPlatform } from '@coffeeit/generator';

import { ListCommand } from '../index.typings';
import * as interact from '../interaction';

export async function onList(argv: ListCommand): Promise<void> {
  interact.printTitle();

  try {
    interact.printInfo('Retrieving components...');

    if (argv.platform) {
      const components = (await getAvailableComponentsForPlatform(argv.platform))
        .map(comp => comp.name);
      interact.printInfo(`Components for platform ${argv.platform}:`);
      interact.printList(components);
    } else {
      const overview = await getAllAvailableComponents();

      interact.printInfo('Available components, grouped by platform:');
      interact.printComponentsOverview(overview);
    }
  } catch (err) {
    if (err instanceof CoffeeGeneratorError) {
      interact.printError(err.message);
    } else {
      throw err;
    }
  }
}
