import { generate, RepoFile } from '@coffeeit/generator';
import * as AsyncLock from 'async-lock';
import { OpenDialogOptions, ProgressLocation, window, workspace } from 'vscode';

import Component from '../model/Component';
import { OVERWRITE_ANSWER } from '../types';

const lock = new AsyncLock();

let overwriteAll: string[] = [];
let ignoreAll: string[] = [];

export async function addComponent(component: Component): Promise<void> {
  const currentWorkspaceFolder =
    workspace.workspaceFolders && workspace.workspaceFolders[0].uri;

  const options: OpenDialogOptions = {
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    defaultUri: currentWorkspaceFolder,
    openLabel: `Add '${component.label}'`,
  };

  const folder = await window.showOpenDialog(options);

  if (folder) {
    await window.withProgress({
      location: ProgressLocation.Notification,
      title: `Adding component '${component.label}'`,
    }, async () => {
      await generate((...params) =>
        onCanOverwrite(...params),
        component.platformName,
        [component.label],
        folder[0].fsPath);

      overwriteAll = [];
      ignoreAll = [];
    });
  }
}

export async function onCanOverwrite(
  fileToOverwrite: RepoFile,
  component: string): Promise<boolean> {
  window.showWarningMessage('Some files aready exist in the target destination');
  const options = [
    OVERWRITE_ANSWER.YES,
    OVERWRITE_ANSWER.YES_TO_ALL,
    OVERWRITE_ANSWER.NO,
    OVERWRITE_ANSWER.NO_TO_ALL];
  const text = `File ${fileToOverwrite.name} in component ` +
    `${component} already exists in the chosen folder root, want to overwrite it?`;

  return await lock.acquire('prompt', async () => {
    if (overwriteAll.includes(component)) return true;
    if (ignoreAll.includes(component)) return false;

    const answer = await window.showQuickPick(options, { placeHolder: text });

    switch (answer) {
      case OVERWRITE_ANSWER.YES:
        return true;
      case OVERWRITE_ANSWER.YES_TO_ALL:
        overwriteAll.push(component);
        return true;
      case OVERWRITE_ANSWER.NO_TO_ALL:
        ignoreAll.push(component);
        return false;
      case OVERWRITE_ANSWER.NO:
      default:
        return false;
    }
  });
}
