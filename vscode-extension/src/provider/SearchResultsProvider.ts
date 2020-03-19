import { commands, Event, EventEmitter, TreeItem, window } from 'vscode';
import { getSearchQuery, performSearch } from '../commands/search';
import EmptyComponent from '../model/EmptyComponent';
import Platform from '../model/Platform';
import Provider from './Provider';

export default class SearchResultsProvider implements Provider {
  private _onDidChangeTreeData: EventEmitter<TreeItem> =
    new EventEmitter<TreeItem>();

  // tslint:disable-next-line: member-ordering
  public readonly onDidChangeTreeData: Event<TreeItem> =
    this._onDidChangeTreeData.event;

  private query: string = null;
  private searchResults: Platform[] = null;

  public async onActivate(): Promise<void> {
    commands.executeCommand('setContext', 'isSearchQueryResult', true);
  }

  public async onRefresh(): Promise<void> {
    this.searchResults = null;
    this._onDidChangeTreeData.fire();
  }

  public onDeActivate(): void {
    this.searchResults = null;
    commands.executeCommand('setContext', 'isSearchQueryResult', false);
  }

  public getTreeItem(element: Platform): TreeItem {
    return element;
  }

  public async getChildren(platform?: Platform): Promise<TreeItem[]> {
    return platform
      ? this.searchResults.find(foundPlatform => foundPlatform.label === platform.label).components
      : this.searchResults;
  }

  public async search(query: string): Promise<void> {
    this.query = query;

    this.searchResults = await performSearch(this.query);
    this._onDidChangeTreeData.fire();
  }
}
