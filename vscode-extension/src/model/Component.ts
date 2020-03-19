import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export default class Component extends TreeItem {
  public iconPath = this.isFolder ? new ThemeIcon('folder') : new ThemeIcon('file-code');

  constructor(
    public readonly label: string,
    public readonly platformName: string,
    public isFolder: boolean,
    public readonly docsUrl?: string,
    public contextValue = docsUrl ? 'componentWithDocs' : 'component',
  ) {
    super(label, TreeItemCollapsibleState.None);
  }

}
