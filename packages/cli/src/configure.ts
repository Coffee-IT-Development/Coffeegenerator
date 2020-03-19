import { configureClientId, configureRepo, getAvailableGroups } from '@coffeeit/generator';
import * as Conf from 'conf';

import { printError, printInfo, printList, promptUser } from './interaction';

const CLIENT_ID_KEY = 'clientId';
const REPO_GROUP_ID_KEY = 'repoGroupId';
const BRANCH_KEY = 'branch';

interface RepoConfig {
  [CLIENT_ID_KEY]: string;
  [REPO_GROUP_ID_KEY]: string;
  [BRANCH_KEY]: string;
}

const defaults = {
  [BRANCH_KEY]: 'master',
  [CLIENT_ID_KEY]: '98963e0cd674f282a9e2d02a753a03de7ad6856b50d6a70f881239da699abe35',
};

export async function initializeAPI(): Promise<void> {
  const config = new Conf<RepoConfig>();

  const repoGroupId = config.get(REPO_GROUP_ID_KEY, null);
  const clientId = config.get(CLIENT_ID_KEY, null);
  const branch = config.get(BRANCH_KEY, null);

  if (!repoGroupId || !clientId || !branch) {
    const userSubmittedConfiguration = await createRepoConfiguration();
    await applyNewConfigurationOnDisk(userSubmittedConfiguration);
  } else {
    configureRepo(repoGroupId, branch);
    configureClientId(clientId);
  }
}

export async function applyNewConfigurationOnDisk(
  { clientId, repoGroupId, branch }: RepoConfig): Promise<void> {
  const config = new Conf<RepoConfig>();
  config.set(REPO_GROUP_ID_KEY, repoGroupId);
  config.set(CLIENT_ID_KEY, clientId);
  config.set(BRANCH_KEY, branch);

  configureRepo(repoGroupId, branch);
  configureClientId(clientId);
}

export function resetConfiguration(): void {
  const config = new Conf<RepoConfig>();
  config.clear();
  configureClientId(defaults[CLIENT_ID_KEY]);
  configureRepo(null, defaults[BRANCH_KEY]);
}

export async function createRepoConfiguration(includeClientId = false): Promise<RepoConfig> {
  const availableRepoGroups = await getAvailableGroups();

  const groupOverview = availableRepoGroups.map(group => `${group.id}: ${group.name}`);
  const groupIds = availableRepoGroups.map(group => group.id.toString());

  printInfo('Available repository groups:');
  printList(groupOverview);

  const repoGroupId =
    await promptUserForSetting('Which repository group do you want to use?', groupIds);

  const branch = await promptUserForSetting(
    'Which branch do you want to use for the component repo\'s?', null, defaults[BRANCH_KEY],
  );

  const clientId = includeClientId
    ? await promptUserForSetting(
      'Which client ID do you want to use for authentication?', null, defaults[CLIENT_ID_KEY],
    )
    : defaults[CLIENT_ID_KEY];

  return {
    branch,
    clientId,
    repoGroupId,
  };
}

async function promptUserForSetting(
  question: string,
  acceptableValues?: string[],
  defaultValue?: string): Promise<string> {
  let answer: string = null;
  let answerIsValid: boolean = false;

  const questionText = defaultValue
    ? `${question} Default: ${defaultValue} => `
    : `${question} => `;

  while (!answerIsValid) {
    answer = await promptUser(questionText);

    if (answer.length < 1 && defaultValue) answer = defaultValue;
    answerIsValid = acceptableValues ? acceptableValues.includes(answer) : answer.length > 0;

    if (!answerIsValid && acceptableValues) {
      printError('Please enter a valid value, valid values are:');
      printList(acceptableValues);
    } else if (!answerIsValid) {
      printError('Please enter a valid value');
    }
  }

  return answer;
}
