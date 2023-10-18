import taskcluster from 'taskcluster-client';
import { fakeauth, stickyLoader, Secrets, withMonitor } from 'taskcluster-lib-testing';
import load from '../src/main';
import builder from '../src/api.js';
import { withDb } from 'taskcluster-lib-testing';

export const load = stickyLoader(load);

suiteSetup(async function() {
  exports.load.inject('profile', 'test');
  exports.load.inject('process', 'test');
});

withMonitor(exports);

// set up the testing secrets
export const secrets = new Secrets({
  secrets: {
  },
  load: exports.load,
});

export const withDb = (mock, skipping) => {
  withDb(mock, skipping, exports, 'secrets');
};

// Some clients for the tests, with differents scopes.  These are turned
// into temporary credentials based on the main test credentials, so
// the clientIds listed here are purely internal to the tests.
let testClients = {
  'captain-write': ['secrets:set:captain:*'],
  'captain-read': ['secrets:get:captain:*'],
  'captain-read-write': ['secrets:set:captain:*', 'secrets:get:captain:*', 'secrets:list-secrets'],
  'captain-read-limited': ['secrets:get:captain:limited/*'],
  'none': [],
};

/**
 * Set up an API server.  Call this after withSecret, so the server
 * uses the same Secret class.
 *
 * This also sets up helper.client as an API client generator, using the
 * "captain" clients.
 */
export const withServer = (mock, skipping) => {
  let webServer;

  suiteSetup(async function() {
    if (skipping()) {
      return;
    }
    await load('cfg');

    // even if we are using a "real" rootUrl for access to Azure, we use
    // a local rootUrl to test the API, including mocking auth on that
    // rootUrl.
    const rootUrl = 'http://localhost:60415';
    exports.load.cfg('taskcluster.rootUrl', rootUrl);
    fakeauth.start(testClients, { rootUrl });

    export const client = async clientId => {
      const SecretsClient = taskcluster.createClient(builder.reference());

      return new SecretsClient({
        credentials: { clientId, accessToken: 'unused' },
        rootUrl,
        retries: 0,
      });
    };

    webServer = await load('server');
  });

  suiteTeardown(async function() {
    if (skipping()) {
      return;
    }
    if (webServer) {
      await webServer.terminate();
      webServer = null;
    }
    fakeauth.stop();
  });
};
