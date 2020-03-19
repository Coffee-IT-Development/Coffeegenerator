import { CoffeeGeneratorError, logout } from '@coffeeit/generator';
import { printError, printInfo } from '../interaction';

export async function onLogout(): Promise<void> {
  try {
    await logout();
    printInfo('You are logged out!');
  } catch (err) {
    if (err instanceof CoffeeGeneratorError) {
      printError(err.message);
    } else {
      throw err;
    }
  }
}
