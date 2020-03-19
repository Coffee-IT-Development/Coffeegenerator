// tslint:disable: no-string-literal
import { configureClientId, configureRepo, getAvailableGroups } from '@coffeeit/generator';
import { ConfigurationTarget, QuickPickItem, window, workspace } from 'vscode';
import { UserInputError } from './types';

const CONFIGURATION_GROUP = 'CoffeeGenerator';
const REPO_GROUP_KEY = 'repoGroup';
const BRANCH_KEY = 'branch';
const CLIENT_ID_KEY = 'clientId';

interface Configuration {
  [BRANCH_KEY]: string;
  [CLIENT_ID_KEY]: string;
  [REPO_GROUP_KEY]: string;
}

const defaults = {
  [BRANCH_KEY]: 'master',
  [CLIENT_ID_KEY]: '98963e0cd674f282a9e2d02a753a03de7ad6856b50d6a70f881239da699abe35',
};

export async function updateConfiguration(): Promise<void> {
  const configuration = getConfigFromConfigPanel();

  for (const key of Object.keys(configuration)) {
    if (!configuration[key] && key !== REPO_GROUP_KEY) {
      const defaultValue = defaults[key];
      await updateSettingInVsCode(key, defaultValue ? defaultValue : null);
    }

    if (key === CLIENT_ID_KEY) {
      configureClientId(configuration[CLIENT_ID_KEY] || defaults[CLIENT_ID_KEY]);
    }
  }

  if (!configuration[REPO_GROUP_KEY]) {
    try {
      const id = await requestRepoIdFromUser();
      await updateSettingInVsCode(REPO_GROUP_KEY, id);
    } catch (err) {
      if (err instanceof UserInputError) {
        await updateSettingInVsCode(REPO_GROUP_KEY, configuration[REPO_GROUP_KEY]);
        window.showErrorMessage(err.message);
      } else throw err;
    }
  }

  configureRepo(configuration[REPO_GROUP_KEY], configuration[BRANCH_KEY]);
  configureClientId(configuration[CLIENT_ID_KEY]);
}

export async function resetConfiguration(): Promise<void> {
  await updateSettingInVsCode(REPO_GROUP_KEY, null);
  await updateSettingInVsCode(BRANCH_KEY, defaults[BRANCH_KEY]);
  await updateSettingInVsCode(CLIENT_ID_KEY, defaults[CLIENT_ID_KEY]);

  configureClientId(defaults[CLIENT_ID_KEY]);
  configureRepo(null, defaults[BRANCH_KEY]);
}

export async function resetRepoGroup(): Promise<void> {
  configureRepo(null, defaults[BRANCH_KEY]);
  await updateSettingInVsCode(REPO_GROUP_KEY, null);
}

async function requestRepoIdFromUser(): Promise<string> {
  const availableGroups = await getAvailableGroups();
  const quickPickItems: QuickPickItem[] = availableGroups.map((group) => {
    return {
      desc: group.description,
      id: group.id,
      label: `${group.id}: ${group.name}${group.description && ' - '}${group.description}`,
    };
  });

  const answer = await window.showQuickPick(quickPickItems, { placeHolder: 'Which repository group should be used for the component generator?' });

  if (!answer) {
    throw new UserInputError('You need to specify a repository group in order to use this extension. You can change this setting in the preferences menu');
  }

  return answer['id'];
}

async function updateSettingInVsCode(
  key: string,
  value: string): Promise<void> {
  const config = workspace.getConfiguration(CONFIGURATION_GROUP);
  if (workspace.workspaceFolders) {
    await config.update(key, value, ConfigurationTarget.Workspace);
  }

  await config.update(key, value, ConfigurationTarget.Global);
}

function getConfigFromConfigPanel(): Configuration {
  const config = workspace.getConfiguration(CONFIGURATION_GROUP);
  return {
    [BRANCH_KEY]: config.get(BRANCH_KEY),
    [CLIENT_ID_KEY]: config.get(CLIENT_ID_KEY),
    [REPO_GROUP_KEY]: config.get(REPO_GROUP_KEY),
  };
}
