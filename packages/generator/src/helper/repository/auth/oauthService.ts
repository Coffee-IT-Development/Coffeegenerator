import { createHash } from 'crypto';

import { oauthConfig, OAuthConfig } from '../../../config/oauth';
import * as httpServer from '../http/httpServer';

export async function requestOauthTokenFromProvider(): Promise<string> {
  const stateHash = createHash('md5').update(Math.random().toString()).digest('hex');

  const tokenUrl = createTokenRequestURL(oauthConfig, stateHash);
  const receivedToken = await httpServer.waitForCodeResponse(tokenUrl, stateHash);
  return receivedToken;
}

function createTokenRequestURL(conf: OAuthConfig, stateHash: string): string {
  const redirectURI = `http://${oauthConfig.responseServerUrl}:${oauthConfig.responseServerPort}/oauth/redirect`;
  return `${conf.oauthTokenUrl}?client_id=${conf.clientId()}&redirect_uri=${redirectURI}&response_type=token&scope=${conf.scope}&state=${stateHash}`;
}
