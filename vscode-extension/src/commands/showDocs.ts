import { getDocumentationContents } from '@coffeeit/generator';

import { ViewColumn, window, workspace } from 'vscode';
import Component from '../model/Component';

export async function showDocs(component: Component): Promise<void> {
  if (component.docsUrl) {
    const documentation = await getDocumentationContents(component.platformName, component.docsUrl);
    const document =
      await workspace.openTextDocument({ content: documentation, language: 'markdown' });

    await window.showTextDocument(document,
      { preserveFocus: true, preview: true, viewColumn: ViewColumn.Beside });
  } else {
    window.showErrorMessage(`Component ${component.label} has no documentation available`);
  }
}
