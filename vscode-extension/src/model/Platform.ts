import { Repo } from '@coffeeit/generator';
import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';

export default class Platform extends TreeItem {
  public iconPath = new ThemeIcon('package');

  public contextValue = 'platform';

  constructor(
    public readonly label: string,
    public readonly repo: Repo,
    public components: TreeItem[],
    public readonly state?: TreeItemCollapsibleState,
  ) {
    super(label, state || TreeItemCollapsibleState.Collapsed);
  }
}
