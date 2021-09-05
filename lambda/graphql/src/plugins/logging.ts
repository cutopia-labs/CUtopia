// Reference: https://www.apollographql.com/docs/apollo-server/integrations/plugins/#end-hooks

const logError = (requestContext, type, err) => {
  const query = requestContext.request.query;
  const variables = JSON.stringify(requestContext.request.variables, null, 2);
  const { user, ip } = requestContext.context;

  console.error(`${type}/${user ? user.username : ip}`, err, query, variables);
};

const loggingPlugin = {
  async requestDidStart(requestContext) {
    return {
      async parsingDidStart() {
        return async err => {
          if (err) {
            logError(requestContext, 'parsing', err);
          }
        };
      },
      async validationDidStart() {
        return async errs => {
          if (errs) {
            logError(requestContext, 'val', errs);
          }
        };
      },
      async executionDidStart() {
        return {
          async executionDidEnd(err) {
            if (err) {
              logError(requestContext, 'exec', err);
            }
          },
        };
      },
    };
  },
};

export default loggingPlugin;
