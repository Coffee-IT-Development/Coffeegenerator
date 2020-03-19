import { ThemeIcon, TreeItem } from 'vscode';

export default class EmptyComponent extends TreeItem {
  public contextValue = 'notavailable';
  public iconPath = new ThemeIcon('close');

  constructor() {
    super('No components available', null);
  }
}
