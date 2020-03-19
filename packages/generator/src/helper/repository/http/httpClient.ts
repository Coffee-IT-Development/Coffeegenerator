import nodeFetch, { Response } from 'node-fetch';

import { renewToken } from '../auth/tokenStore';
import { RepoFile } from '../types';
import { HttpError, HttpErrorCode } from './types';

export async function performRequest<T>(
  url: string,
  method = 'GET',
  token?: string,
  expectJson = true,
): Promise<T> {
  try {
    let response = await request(url, method, expectJson, token);

    if (response.status === 401) {
      const newToken = await renewToken();
      response = await request(url, method, expectJson, newToken);

      if (response.status === 401) {
        throw new HttpError('You\'re not authorized for the required GitLab repositories. Check with your administrator', HttpErrorCode.NOT_AUTHORIZED);
      }
    }

    if (response.status === 404) {
      throw new HttpError('Requested resource not found', HttpErrorCode.NOT_FOUND);
    }

    if (!response.ok) {
      throw new HttpError(`Received status code ${response.status} while performing request to URL: ${url}`, HttpErrorCode.OTHER);
    }

    const body = expectJson
      ? await response.json()
      : await response.text();

    return body;
  } catch (err) {
    if (err.code && err.code === 'ENOTFOUND') {
      throw new HttpError('Connection to the GitLab API could not be made, please check your internet connection', HttpErrorCode.NO_CONNECTION);
    } else throw err;
  }
}

export async function getFileTreePaginatedFromAPI(url: string, token: string): Promise<RepoFile[]> {
  const items: RepoFile[] = [];

  const initialResponse = await request(url, 'GET', false, token);
  if (!initialResponse.ok) {
    throw new HttpError('An error occurred while retrieving file tree', 500);
  }

  const amountOfPages = parseInt(initialResponse.headers.get('X-Total-Pages'), 10);
  let retrievedItems = await initialResponse.json();
  items.push(...retrievedItems);

  if (amountOfPages > 1) {
    for (let i = 2; i <= amountOfPages; i += 1) {
      const newUrl = `${url}&page=${i}`;
      const response = await request(newUrl, 'GET', true, token);
      if (!response.ok) {
        throw new HttpError('An error occurred while retrieving file tree', 500);
      }
      retrievedItems = await response.json();
      items.push(...retrievedItems);
    }
  }
  return items;
}

async function request(
  url: string,
  method: string,
  expectJson: boolean,
  token?: string): Promise<Response> {
  return token
    ? await nodeFetch(url, {
      method,
      headers: {
        Accept: expectJson ? 'application/json' : 'text/plain',
        Authorization: `Bearer ${token}`,
      },
    })
    : await nodeFetch(url, {
      method,
      headers: {
        Accept: expectJson ? 'application/json' : 'text/plain',
      },
    });
}
