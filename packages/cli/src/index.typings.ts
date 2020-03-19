export interface GenerateCommand {
  _: [string];
  p: string;
  platform: string;
  '$0': string;
  components: [string];
  o?: string;
  outputFolder?: string;
}

export interface ListCommand {
  _: [string];
  p: string;
  platform: string;
  '$0': string;
  list: string;
}
