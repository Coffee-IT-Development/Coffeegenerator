import * as express from 'express';
import * as http from 'http';
import * as path from 'path';

import { oauthConfig } from '../../../config/oauth';
import { ShouldOpenBrowserSubject } from '../../observer/Subject';
import { onError, onResponse as onResolve } from '../types';
import { AccessDeniedError, SecurityError } from './types';

export const shouldOpenBrowser = new ShouldOpenBrowserSubject();

let onResolve: onResolve;
let onReject: onError;
let state: string;

const app = express();
let server: http.Server;

const options = {
  root: path.join(__dirname, '../../../../../view'),
};

app.get('/oauth/redirect', (req: express.Request, res: express.Response) => {
  res.sendFile('redirect.html', options);
});

app.get('/oauth', async (req: express.Request, res: express.Response): Promise<void> => {
  try {
    if (req.query.error) {
      if (req.query.error === 'access_denied') {
        res.status(401).send();
        throw new AccessDeniedError('You have denied access to your account, you need to authorize this app to continue');
      } else {
        res.status(500).send();
        throw new Error(req.query.error);
      }
    }

    if (req.query.access_token) {
      if (!req.query.state || req.query.state !== state) {
        res.status(403).send();
        throw new SecurityError('State hash is missing or not the same, an intruder might be trying to steal your credentials');
      }

      server.close();
      onResolve(req.query.access_token);
      res.status(200).send();
    } else {
      res.status(400);
      res.send();
    }
  } catch (err) {
    server.close();
    onReject(err);
  }
});

export function waitForCodeResponse(url: string, stateHash: string): Promise<string> {
  return new Promise((resolve: onResolve, reject: onError) => {
    onResolve = resolve;
    onReject = reject;
    state = stateHash;

    server = app.listen(oauthConfig.responseServerPort, () => {
      shouldOpenBrowser.notify(url);
    });
  });
}
