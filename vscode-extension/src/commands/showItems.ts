import { getAvailableComponentsForPlatform, getPlatformsList } from '@coffeeit/generator';
import { TreeItem } from 'vscode';

import Component from '../model/Component';
import EmptyComponent from '../model/EmptyComponent';
import Platform from '../model/Platform';

export async function getPlatforms(): Promise<Platform[]> {
  const platforms = await getPlatformsList();
  return platforms.map(platform => new Platform(platform.name, platform, []));
}

export async function getComponents(platform: Platform): Promise<TreeItem[]> {
  const componentsOverview = await getAvailableComponentsForPlatform(platform.label, true);
  return componentsOverview.length > 0
    ? componentsOverview.map(component =>
      new Component(component.name, platform.label, component.type === 'tree', component.docsUrl))
    : [new EmptyComponent()];
}
