#!/usr/bin/env node
import * as auth from './config/oauth';
import * as repo from './config/repo';
import { addComponents } from './helper/file/file';
import { onOverwriteWarn } from './helper/file/types';
import * as tokenStore from './helper/repository/auth/tokenStore';
import { getAvailablePlatforms, getAvailableRepoGroups } from './helper/repository/platform';
import { Repo, RepoFile, RepoGroup } from './helper/repository/types';
import { ArgumentError } from './helper/types';
export { Subscriber } from './helper/observer/Subscriber';
export { ArgumentError, CoffeeGeneratorError } from './helper/types';

export * from './helper/file';
export * from './helper/repository';

/**
 * Configures the GitLab repository details
 *
 * @param repoGroupId Id of the repository group in GitLab that should be used
 * @param branchName Name of the branch that that should be used.
 * If not provided, master will be used
 */
export function configureRepo(repoGroup: string, branch: string): void {
  repo.configure(repoGroup, branch);
}

/**
 * Configures the OAuth2 client ID.
 * This ID is used when redirecting users to the GitLab OAuth webpage.
 * If this is not provided, any authentication attempt will fail.
 * You need to call this before calling any repository related function
 *
 * @param oauthClientId OAuth2 Client ID. You can request this at GitLab.
 */
export function configureClientId(clientId: string): void {
  auth.configure(clientId);
}

/**
 * Fetches available repository groups that the user has access to
 */
export async function getAvailableGroups(): Promise<RepoGroup[]> {
  return getAvailableRepoGroups();
}

/**
 * Adds the requested components to the specified folder.
 * If not folder is provided, the current working directory will be used.
 *
 * @param askForOverwrite Callback function that will be called when a
 * file already exists in the output folder. Returned boolean determines
 * whether the file will be overwritten or not
 * @param platform The target you want to add component from
 * @param components list of component you want to be added to the output folder
 * @param outputFolder folder where the components should be placed
 */
export async function generate(
  askForOverwrite: onOverwriteWarn,
  platform: string,
  components: string[],
  outputFolder?: string,
): Promise<void> {
  if (!askForOverwrite) {
    throw new ArgumentError('Required callback \'askForOverwrite\' missing or incorrect');
  }

  if (!platform) {
    throw new ArgumentError('Required argument \'platform\' missing or incorrect');
  }

  if (!components || components.length < 1) {
    throw new ArgumentError('Required argument \'components\' is missing or an empty list');
  }

  await addComponents(platform, components, outputFolder, askForOverwrite);
}

/**
 * Returns a list with available platforms
 * @returns Repo[] List of platform repositories
 */
export async function getPlatformsList(): Promise<Repo[]> {
  return await getAvailablePlatforms();
}

/**
 * Removes saved tokens from your OS's token store
 */
export async function logout(): Promise<void> {
  await tokenStore.logout();
}
