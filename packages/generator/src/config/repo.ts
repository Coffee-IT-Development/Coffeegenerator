import { ConfigurationError } from '../helper/types';

let platformRepoGroupId: string = null;

export interface RepoSettings {
  branchName: string;
  apiBaseUrl: string;
  platformRepoGroupId(): string;
}

export const repoConfig: RepoSettings = {
  apiBaseUrl: 'https://gitlab.com/api/v4',
  branchName: 'master',
  platformRepoGroupId: getPlatformRepoGroupId,
};

function getPlatformRepoGroupId(): string {
  if (!platformRepoGroupId) {
    throw new ConfigurationError('Platform repository group ID is not configured, call configure() first');
  }
  return platformRepoGroupId;
}

export function configure(repoGroupId?: string, branchName?: string): void {
  if (branchName) repoConfig.branchName = branchName;
  if (repoGroupId) platformRepoGroupId = repoGroupId;
}
