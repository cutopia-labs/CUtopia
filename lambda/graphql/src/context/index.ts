import { Token, verify } from '../jwt';

export interface Context {
  user: Token;
  ip: string;
}

const context = async ({ event: lambdaEvent }) => {
  const ip = lambdaEvent.requestContext.identity.sourceIp;
  const split = (lambdaEvent.headers.Authorization || '').split('Bearer ');

  const defaultContext = {
    user: null,
    ip,
  };

  if (split.length !== 2) {
    return defaultContext;
  }
  const token = split[1];
  const userContext = await verify(token);
  return {
    ...defaultContext,
    user: userContext,
  };
};

export default context;
