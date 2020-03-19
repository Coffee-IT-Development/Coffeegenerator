import { Repo } from '.';
import { ArgumentError } from '../..';
import { repoConfig } from '../../config/repo';
import { getToken } from './auth/tokenStore';
import { performRequest } from './http/httpClient';
import { RepoGroup } from './types';

export async function getAvailableRepoGroups(): Promise<RepoGroup[]> {
  const token = await getToken();

  const url = `${repoConfig.apiBaseUrl}/groups`;
  const groups = await performRequest<RepoGroup[]>(url, 'GET', token);
  return groups;
}

export async function getAvailablePlatforms(): Promise<Repo[]> {
  const token = await getToken();
  const url = `${repoConfig.apiBaseUrl}/groups/${repoConfig.platformRepoGroupId()}/projects?order_by=name&simple=true`;
  const repositories = await performRequest<Repo[]>(url, 'GET', token);
  return repositories;
}

export async function getRepoByPlatformName(requestedPlatform: string): Promise<Repo> {
  const platformRepos = await getAvailablePlatforms();
  const foundRepo = platformRepos
    .find(repo => repo.name.toLowerCase() === requestedPlatform.toLowerCase());

  if (!foundRepo) throw new ArgumentError(`Platform ${requestedPlatform} not found`);
  return foundRepo;
}
