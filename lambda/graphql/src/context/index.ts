import { verify } from '../jwt';

const DEFAULT_CONTEXT = {
  authenticated: false,
  user: null,
};

const context = async ({ event: lambdaEvent, context: lambdaContext }) => {
  try {
    const split = (lambdaEvent.headers.Authorization || '').split('Bearer ');

    // length === 1: Missing auth
    // length > 2: Bad request
    if (split.length !== 2 || split[1].length < 10) {
      return DEFAULT_CONTEXT;
    }
    const token = split[1];
    const userContext = verify(token);

    return userContext
      ? {
          authenticated: true,
          user: userContext,
        }
      : DEFAULT_CONTEXT;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export default context;
