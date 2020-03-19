import { ConfigurationError } from '../helper/types';

let clientId: string = null;

export interface OAuthConfig {
  oauthTokenUrl: string;
  scope: string;
  responseServerUrl: string;
  responseServerPort: number;
  clientId(): string;
}

export const oauthConfig: OAuthConfig = {
  clientId: getOAuthClientId,
  oauthTokenUrl: 'https://gitlab.com/oauth/authorize',
  responseServerPort: 8123,
  responseServerUrl: '127.0.0.1',
  scope: 'api',
};

function getOAuthClientId(): string {
  if (!clientId) {
    throw new ConfigurationError('Client ID is not configured');
  }
  return clientId;
}

export function configure(oauthClientId: string): void {
  clientId = oauthClientId;
}
