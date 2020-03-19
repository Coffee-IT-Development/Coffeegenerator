import { RepoFile } from '../repository/types';

export type onOverwriteWarn =
  (fileToOverwrite: RepoFile, component: string) => Promise<boolean>;

export interface FileOverview {
  successful: string[];
  failed: string[];
}

export enum ComponentStatus {
  SUCCESS, NOT_FOUND, SKIPPED,
}
