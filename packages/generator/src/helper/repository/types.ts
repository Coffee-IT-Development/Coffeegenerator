export interface Repo {
  id: number;
  description: string;
  url: string;
  name: string;
  path: string;
  components: RepoFile[];
}

export interface RepoFile {
  id: string;
  name: string;
  type: string;
  path: string;
  docsUrl?: string;
}

export interface RepoGroup {
  id: string;
  name: string;
  description: string;
  visibility: string;
}

export interface RawFile {
  file_name: string;
  file_path: string;
  size: number;
  encoding: string;
  content: string;
}

export interface UserStatus {
  emoji: string;
  message: string;
  message_html: string;
}

export type onResponse = (code: string) => void;
export type onError = (error: Error) => void;

export const ABOUT_FOLDER_NAME = '.cgabout';
export const DOCFILE_EXTENSION = '.md';
