// tslint:disable: no-empty
import { getDocumentationContents } from '@coffeeit/generator';
import * as vscode from 'vscode';

import { getComponents, getPlatforms } from '../commands/showItems';
import Component from '../model/Component';
import Platform from '../model/Platform';
import Provider from './Provider';

export default class ComponentsProvider implements Provider {
  private _onDidChangeTreeData: vscode.EventEmitter<vscode.TreeItem> =
    new vscode.EventEmitter<vscode.TreeItem>();

  // tslint:disable-next-line: member-ordering
  public readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem> =
    this._onDidChangeTreeData.event;

  private cache: Platform[] = [];

  public onActivate(): void { }

  public onRefresh(): void {
    this.cache = [];
    this._onDidChangeTreeData.fire();
  }

  public onDeActivate(): void { }

  public getTreeItem(element: Platform): vscode.TreeItem {
    return element;
  }

  public async getChildren(item?: Platform): Promise<vscode.TreeItem[]> {
    if (!item) {
      if (this.cache.length < 1) {
        this.cache = await getPlatforms();
      }
      return this.cache;
    }

    if (item.components.length < 1) {
      item.components = await getComponents(item);
    }
    return item.components;
  }
}
