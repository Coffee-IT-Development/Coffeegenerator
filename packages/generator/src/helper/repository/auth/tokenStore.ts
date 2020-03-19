import { deletePassword, getPassword, setPassword } from 'keytar';

import { BaseSubject } from '../../observer/Subject';

import * as oauthService from './oauthService';
import { TokenError } from './types';

const serviceName = 'coffeegenerator';
const account = 'gitlab';

let cachedKey: string;

export const authenticationStartSubject = new BaseSubject();
export const authenticationSuccessSubject = new BaseSubject();

export async function getToken(): Promise<string> {
  if (!cachedKey) {
    const keyFromStore = await getPassword(serviceName, account);

    if (keyFromStore) {
      cachedKey = keyFromStore;
    } else {
      await renewToken();
    }
  }
  return cachedKey;
}

export async function renewToken(): Promise<string> {
  authenticationStartSubject.notify();

  try {
    cachedKey = await oauthService.requestOauthTokenFromProvider();
    addTokenToStore(cachedKey);
    authenticationSuccessSubject.notify();
    return cachedKey;
  } catch (err) {
    throw new TokenError(`Something went wrong while retrieving the authentication token for GitLab: ${err.message}`);
  }
}

export async function logout(): Promise<void> {
  cachedKey = null;
  await deletePassword(serviceName, account);
}

async function addTokenToStore(key: string): Promise<void> {
  return await setPassword(serviceName, account, key);
}
