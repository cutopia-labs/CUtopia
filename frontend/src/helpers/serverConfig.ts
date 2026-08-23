const AWS_REGION = 'ap-southeast-1';

const SERVER_IDS = {
  production: 'eisbgazs16',
  staging: '1reoh16ya2',
} as const;

interface ServerConfig {
  address: string;
  id: typeof SERVER_IDS.production | typeof SERVER_IDS.staging;
}

/**
 * Resolve the API without allowing a staging build to leak a localhost URL.
 * Amplify sets REACT_APP_ENV_MODE per hosted environment.
 */
export const resolveServerConfig = (
  nodeEnv?: string,
  appEnv?: string
): ServerConfig => {
  if (nodeEnv === 'development') {
    return {
      address: 'http://localhost:4000',
      id: SERVER_IDS.staging,
    };
  }

  const normalizedAppEnv = appEnv?.trim().toLowerCase();
  const isStaging =
    normalizedAppEnv === 'dev' || normalizedAppEnv === 'staging';
  const isProduction =
    !normalizedAppEnv ||
    normalizedAppEnv === 'prod' ||
    normalizedAppEnv === 'production';

  if (!isStaging && !isProduction) {
    throw new Error(`Unsupported REACT_APP_ENV_MODE: ${appEnv}`);
  }

  const id = isStaging ? SERVER_IDS.staging : SERVER_IDS.production;
  return {
    address: `https://${id}.execute-api.${AWS_REGION}.amazonaws.com/Prod`,
    id,
  };
};
