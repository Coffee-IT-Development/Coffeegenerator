import { repoConfig } from '../../config/repo';
import { getToken } from './auth/tokenStore';
import { performRequest } from './http/httpClient';
import { getRepoByPlatformName } from './platform';
import { DOCFILE_EXTENSION, RepoFile } from './types';

export async function getDocumentationContents(
  platformName: string,
  docsPath: string): Promise<string> {
  const repo = await getRepoByPlatformName(platformName);

  const urlEncodedPath = encodeURIComponent(docsPath);
  const url = `${repoConfig.apiBaseUrl}/projects/${repo.id}/repository/files/${urlEncodedPath}/raw?ref=${repoConfig.branchName}`;
  const token = await getToken();

  const docsFile = await performRequest<string>(url, 'GET', token, false);

  return docsFile;
}

export async function addDocumentationToEntries(
  entries: RepoFile[],
  docFiles: RepoFile[]): Promise<RepoFile[]> {
  return entries
    .map((entry) => {
      const docFile = docFiles.find(file =>
        file.name.replace(DOCFILE_EXTENSION, '') === entry.name);

      return docFile
        ? { ...entry, docsUrl: docFile.path }
        : entry;
    });
}
