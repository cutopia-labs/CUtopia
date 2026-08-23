import { describe, expect, it } from '@jest/globals';

import { resolveServerConfig } from './serverConfig';

describe('resolveServerConfig', () => {
  it('uses the local backend only for a local development build', () => {
    expect(resolveServerConfig('development', 'dev')).toEqual({
      address: 'http://localhost:4000',
      id: '1reoh16ya2',
    });
  });

  it.each(['dev', 'staging'])(
    'uses the staging API for the %s hosted environment',
    appEnv => {
      expect(resolveServerConfig('production', appEnv).address).toBe(
        'https://1reoh16ya2.execute-api.ap-southeast-1.amazonaws.com/Prod'
      );
    }
  );

  it.each([undefined, 'prod', 'production'])(
    'uses the production API for the %s hosted environment',
    appEnv => {
      expect(resolveServerConfig('production', appEnv).address).toBe(
        'https://eisbgazs16.execute-api.ap-southeast-1.amazonaws.com/Prod'
      );
    }
  );

  it('fails the build for an unknown hosted environment', () => {
    expect(() => resolveServerConfig('production', 'preview')).toThrow(
      'Unsupported REACT_APP_ENV_MODE: preview'
    );
  });
});
