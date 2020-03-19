import { TreeDataProvider, TreeItem } from 'vscode';

export default interface Provider extends TreeDataProvider<TreeItem> {
  onActivate(): void;
  onRefresh(): void;
  onDeActivate(): void;
}
