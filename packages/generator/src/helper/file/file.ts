import {
  access, constants, ensureDir, pathExists, writeFile,
} from 'fs-extra';
import * as path from 'path';

import { ComponentProcessedSubject } from '../observer/Subject';
import { downloadFileFromRepo, getAvailableComponentsForPlatform, getOverviewFilesInFolder } from '../repository/component';
import { getRepoByPlatformName } from '../repository/platform';
import { Repo, RepoFile } from '../repository/types';
import { ArgumentError } from '../types';

import { ComponentStatus, onOverwriteWarn } from './types';

const workingDir = process.cwd();

export const componentProcessedSubject = new ComponentProcessedSubject();

export async function addComponents(
  platform: string,
  components: string[],
  outputFolderArg: string,
  askForOverwrite: onOverwriteWarn,
): Promise<void> {
  const outputDir = outputFolderArg || workingDir;

  if (!(await pathHasWriteAccess(outputDir))) {
    throw new ArgumentError(
      `Output folder ${outputDir} does not exist or has no write permissions`);
  }

  const availableComponents = await getAvailableComponentsForPlatform(platform);

  if (availableComponents.length < 1) {
    throw new ArgumentError(`No components available for platform ${platform}`);
  }

  const promises: Promise<void>[] = [];

  components.forEach((requestedComponent: string) => {
    const component = availableComponents.find(c =>
      c.name.toLowerCase() === requestedComponent.toLowerCase());

    if (component) {
      promises.push(component.type === 'tree'
        ? addFolderComponent(platform, component, outputDir, askForOverwrite)
        : addFileComponent(platform, component, outputDir, askForOverwrite));
    } else {
      componentProcessedSubject.notify(platform, requestedComponent, ComponentStatus.NOT_FOUND);
    }
  });
  await Promise.all(promises);
}

async function addFileComponent(
  platform: string,
  component: RepoFile,
  outputDir: string,
  askForOverwrite: onOverwriteWarn): Promise<void> {
  const repository = await getRepoByPlatformName(platform);
  const fileAdded = await addFileToDisk(repository, component, outputDir, askForOverwrite);

  componentProcessedSubject.notify(
    platform,
    component.name,
    fileAdded ? ComponentStatus.SUCCESS : ComponentStatus.SKIPPED,
  );
}

async function addFolderComponent(
  platform: string,
  component: RepoFile,
  outputFolder: string,
  askForOverwrite: onOverwriteWarn,
): Promise<void> {
  const repository = await getRepoByPlatformName(platform);
  const rawEntries = await getOverviewFilesInFolder(repository, component);
  const cleanEntries = path.sep !== '/'
    ? rawEntries.map(entry => ({ path: entry.path.replace('/', path.delimiter), ...entry }))
    : rawEntries;

  await createFoldersBeforeCopy(component.name, cleanEntries, outputFolder);

  const files = cleanEntries.filter(entry => entry.type === 'blob');

  let amountIgnored = 0;
  const filePromises = files.map(async (file: RepoFile) => {
    const fileAdded = await addFileToDisk(
      repository, file, outputFolder, fileEntry => askForOverwrite(fileEntry, component.name));

    if (!fileAdded) amountIgnored += 1;
  });
  await Promise.all(filePromises);

  const status = amountIgnored === files.length
    ? ComponentStatus.SKIPPED
    : ComponentStatus.SUCCESS;

  componentProcessedSubject.notify(platform, component.name, status);
}

async function createFoldersBeforeCopy(
  componentName: string,
  entries: RepoFile[],
  outputFolder: string): Promise<void> {
  await ensureDir(path.join(outputFolder, componentName));

  const folders = entries.filter(entry => entry.type === 'tree')
    .sort((a, b): number =>
      a.path.split(path.delimiter).length - b.path.split(path.delimiter).length,
    );

  const folderPromises = folders.map(async (folder) => {
    const targetPath = path.join(outputFolder, folder.path);
    await ensureDir(targetPath);
  });

  await Promise.all(folderPromises);
}

async function addFileToDisk(
  repo: Repo,
  fileEntry: RepoFile,
  outputFolder: string,
  askForOverwrite: onOverwriteWarn,
): Promise<boolean> {
  const filePath = path.join(outputFolder, fileEntry.path);
  if (await pathExists(filePath)) {
    const canOverwrite = await askForOverwrite(fileEntry, filePath);
    if (!canOverwrite) return false;
  }

  const repoFile = await downloadFileFromRepo(repo, fileEntry);
  await writeFileToDisk(path.join(outputFolder, fileEntry.path), repoFile, true);

  return true;
}

async function pathHasWriteAccess(pathToCheck: string): Promise<boolean> {
  try {
    await access(pathToCheck, constants.W_OK);
    return true;
  } catch (err) {
    return false;
  }
}

export async function writeFileToDisk(
  dest: string,
  file: Buffer,
  overwrite = false): Promise<void> {
  const options = {
    flag: overwrite ? 'w' : 'wx',
  };

  writeFile(dest, file, options);
}
