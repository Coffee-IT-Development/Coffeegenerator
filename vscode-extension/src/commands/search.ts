import { getAllAvailableComponents } from '@coffeeit/generator';

import { ProgressLocation, TreeItemCollapsibleState, window } from 'vscode';
import Component from '../model/Component';
import EmptyComponent from '../model/EmptyComponent';
import Platform from '../model/Platform';

export async function getSearchQuery(): Promise<string> {
  const query = await window.showInputBox({
    ignoreFocusOut: true,
    placeHolder: 'Please enter the name of the component you want to search for',
    prompt: 'Search query: ',
  });

  return query;
}

export async function performSearch(query: string): Promise<Platform[]> {
  return await window.withProgress({
    location: ProgressLocation.Notification,
    title: `Searching for '${query}'`,
  }, async () => {
    const platforms = await getAllAvailableComponents(true);
    const results: Platform[] = [];

    platforms.forEach((platformRepo) => {
      const components = platformRepo.components
        .filter(component => component.name.toLowerCase().includes(query.toLowerCase()))
        .map(component => new Component(
          component.name,
          component.docsUrl,
          component.type === 'tree',
          platformRepo.name));

      results.push(new Platform(
        platformRepo.name,
        platformRepo,
        components.length < 1 ? [new EmptyComponent()] : components,
        TreeItemCollapsibleState.Expanded));
    });

    return results;
  });

}
