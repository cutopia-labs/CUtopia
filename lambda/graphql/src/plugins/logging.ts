// Reference: https://www.apollographql.com/docs/apollo-server/integrations/plugins/#end-hooks

const excludedMutations = ['switchTimetable', 'uploadTimetable'];
const excludedVariables = ['password', 'newPassword'];

const getCommonLog = requestContext => {
  const query = requestContext.request.query;
  const variables = JSON.stringify(
    Object.fromEntries(
      Object.entries(requestContext.request.variables).filter(
        ([key, value]) => !excludedVariables.includes(key)
      )
    ),
    null,
    2
  );
  const { user, ip } = requestContext.context;
  return `${user ? user.username : ip}\n${query}\n${variables}`;
};

const logMutation = requestContext => {
  if (
    !excludedMutations.includes(
      requestContext.operation.selectionSet.selections[0].name.value
    )
  ) {
    console.log(getCommonLog(requestContext));
  }
};

const logError = (requestContext, type, err) => {
  console.error(`${getCommonLog(requestContext)}\n${type}\n${err}`);
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
        if (requestContext.operation.operation === 'mutation') {
          logMutation(requestContext);
        }

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
