import {
  authenticationStartSubject,
  authenticationSuccessSubject,
  componentProcessedSubject,
  ComponentStatus,
  logout,
  shouldOpenBrowser,
  Subscriber,
} from '@coffeeit/generator';
import { commands, Uri, window, workspace } from 'vscode';

import { addComponent } from './commands/generate';
import { getSearchQuery } from './commands/search';
import { showDocs } from './commands/showDocs';
import { resetConfiguration, resetRepoGroup, updateConfiguration } from './config';
import Component from './model/Component';
import ComponentsProvider from './provider/ComponentsProvider';
import Provider from './provider/Provider';
import SearchResultsProvider from './provider/SearchResultsProvider';

const componentsProvider = new ComponentsProvider();
const searchResultsProvider = new SearchResultsProvider();
let currentProvider: Provider = componentsProvider;

export async function activate(): Promise<void> {
  registerCommands();
  registerGeneratorCallbacks();
  registerConfigurationListener();
  await updateConfiguration();
  setActiveProvider(componentsProvider);
}

function setActiveProvider(provider: Provider): void {
  currentProvider.onDeActivate();
  currentProvider = provider;
  currentProvider.onActivate();
  window.registerTreeDataProvider('componentsOverview', provider);
}

function registerCommand(name: string, commandCallback: any): void {
  commands.registerCommand(name, async (...args) => {
    try {
      await updateConfiguration();
      commandCallback(...args);
    } catch (err) {
      window.showErrorMessage(`Error while executing command ${name}: ${err.message}`);
      throw err;
    }
  });
}

function registerCommands(): void {
  registerCommand('componentsOverview.refresh',
    () => currentProvider.onRefresh());
  registerCommand('componentsOverview.clearResults',
    () => setActiveProvider(componentsProvider));
  registerCommand('componentsOverview.addComponent',
    (component: Component) => addComponent(component));
  registerCommand('componentsOverview.search',
    async () => {
      const query = await getSearchQuery();
      if (query) {
        searchResultsProvider.search(query);
        setActiveProvider(searchResultsProvider);
      }
    });
  registerCommand('componentsOverview.showDocs', showDocs);
  commands.registerCommand('componentsOverview.logout', async () => {
    await logout();
    window.showInformationMessage('Successfully logged out');
    currentProvider.onRefresh();
  });
  registerCommand('componentsOverview.resetRepoGroup', resetRepoGroup);
  commands.registerCommand('componentsOverview.resetSettings', resetConfiguration);
}

function registerConfigurationListener(): void {
  workspace.onDidChangeConfiguration(async () => {
    await updateConfiguration();
    currentProvider.onRefresh();
  });
}

function registerGeneratorCallbacks(): void {
  authenticationStartSubject.subscribe(
    new Subscriber(() => window.showInformationMessage(
      'Please go to your browser and give this app access to your GitLab account')));

  authenticationSuccessSubject.subscribe(
    new Subscriber(() => window.showInformationMessage('Successfully logged in!')));

  shouldOpenBrowser.subscribe(
    new Subscriber((url: string) => {
      window.showInformationMessage(`Please go to this URL: ${url}`);
      commands.executeCommand('vscode.open', Uri.parse(url));
    }));

  componentProcessedSubject.subscribe(
    new Subscriber((
      platform: string,
      component: string,
      status: ComponentStatus,
    ) => {
      switch (status) {
        case ComponentStatus.SUCCESS:
          window.showInformationMessage(`Component '${component}' for platform '${platform}' added successfully`);
          break;
        case ComponentStatus.SKIPPED:
          window.showWarningMessage(`Skipped component '${component}'`);
          break;
        case ComponentStatus.NOT_FOUND:
          window.showWarningMessage(`Component '${component}' for platform '${platform}' not found in repository group`);
          break;
        default:
          throw new Error(`Status ${status} not defined`);
      }
    }),
  );
}
