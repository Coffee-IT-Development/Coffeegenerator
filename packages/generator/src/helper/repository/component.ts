import { repoConfig } from '../../config/repo';
import { getToken } from './auth/tokenStore';
import { addDocumentationToEntries } from './documentation';
import { getFileTreePaginatedFromAPI, performRequest } from './http/httpClient';
import { HttpError, HttpErrorCode } from './http/types';
import { getAvailablePlatforms, getRepoByPlatformName } from './platform';
import { ABOUT_FOLDER_NAME, RawFile, Repo, RepoFile } from './types';

export async function getOverviewFilesInFolder(repo: Repo, folder: RepoFile): Promise<RepoFile[]> {
  if (folder.type !== 'tree') throw new Error(`Component ${folder.name} is not a folder component`);
  const url = `${repoConfig.apiBaseUrl}/projects/${repo.id}/repository/tree?ref=${repoConfig.branchName}&per_page=100&path=${folder.path}&recursive=true`;
  const token = await getToken();

  const entries = await getFileTreePaginatedFromAPI(url, token);
  return entries;
}

export async function downloadFileFromRepo(repo: Repo, file: RepoFile): Promise<Buffer> {
  if (file.type === 'tree') throw new Error(`File ${file.name} is a folder`);

  const urlEncodedPath = encodeURIComponent(file.path);
  const url = `${repoConfig.apiBaseUrl}/projects/${repo.id}/repository/files/${urlEncodedPath}?ref=${repoConfig.branchName}`;

  const token = await getToken();

  const entry = await performRequest<RawFile>(url, 'GET', token);

  if (!Buffer.isEncoding(entry.encoding)) throw new Error(`Received invalid encoding '${entry.encoding}' from the API`);
  return Buffer.from(entry.content, entry.encoding);
}

export async function getAllAvailableComponents(addDocs = false): Promise<Repo[]> {
  const platforms = await getAvailablePlatforms();
  const overview: Repo[] = [];

  const promises = platforms.map(async (platform: Repo) => {
    const components = await getComponentsOnRepo(platform, addDocs);

    overview.push({ ...platform, components });
  });

  await Promise.all(promises);

  return overview;
}

export async function getAvailableComponentsForPlatform(
  platform: string,
  addDocs = false): Promise<RepoFile[]> {
  const repo = await getRepoByPlatformName(platform);
  const foundComponents = await getComponentsOnRepo(repo, addDocs);

  return foundComponents;
}

async function getComponentsOnRepo(repo: Repo, addDocs: boolean): Promise<RepoFile[]> {
  const token = await getToken();
  const url = `${repoConfig.apiBaseUrl}/projects/${repo.id}/repository/tree?ref=${repoConfig.branchName}&per_page=10000`;

  try {
    let entries = await performRequest<RepoFile[]>(url, 'GET', token);

    entries = entries.filter(entry => entry.name !== ABOUT_FOLDER_NAME);

    if (addDocs) {
      const docsUrl = `${repoConfig.apiBaseUrl}/projects/${repo.id}/repository/tree?ref=${repoConfig.branchName}&per_page=10000&path=${ABOUT_FOLDER_NAME}`;
      const docFiles = await performRequest<RepoFile[]>(docsUrl, 'GET', token);
      entries = await addDocumentationToEntries(entries, docFiles);
    }

    return entries;
  } catch (err) {
    if (err instanceof HttpError && err.code === HttpErrorCode.NOT_FOUND) return [];
    throw err;
  }
}
