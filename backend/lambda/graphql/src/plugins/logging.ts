import { ApolloServerPlugin } from 'apollo-server-plugin-base';
import { GraphQLFormattedError } from 'graphql';

const knownFields = new Set([
  'course',
  'ranking',
  'me',
  'timetable',
  'reviews',
  'review',
  'discussion',
  'login',
  'createUser',
  'verifyUser',
  'resendVerification',
  'resetPassword',
  'sendResetPasswordCode',
  'uploadTimetable',
  'removeTimetable',
  'switchTimetable',
  'cloneTimetable',
  'createReview',
  'editReview',
  'voteReview',
  'sendMessage',
  'report',
]);

const isDatabaseError = error =>
  error.extensions?.code === 'DATABASE_UNAVAILABLE' ||
  /^(Mongo|Mongoose)/.test(error.originalError?.name || '');

export const formatError = (error): GraphQLFormattedError => {
  if (isDatabaseError(error)) {
    return {
      message: 'Database temporarily unavailable. Please try again.',
      path: error.path,
      extensions: { code: 'DATABASE_UNAVAILABLE' },
    };
  }
  if (
    error.extensions?.code === 'INTERNAL_SERVER_ERROR' &&
    !/^\d+$/.test(error.message)
  ) {
    return {
      message: 'Request temporarily unavailable. Please try again.',
      path: error.path,
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    };
  }
  // Auth refresh needs its explicitly returned token. Never include exception
  // stack traces, which may contain connection details or user data.
  const { exception, ...extensions } = error.extensions || {};
  return { message: error.message, path: error.path, extensions };
};

const loggingPlugin: ApolloServerPlugin = {
  async requestDidStart() {
    const started = Date.now();
    return {
      async willSendResponse({ operation, errors }) {
        const outcome = errors?.some(isDatabaseError)
          ? 'database_unavailable'
          : errors?.some(
              error =>
                error.extensions?.code === 'INTERNAL_SERVER_ERROR' &&
                !/^\d+$/.test(error.message)
            )
          ? 'server_error'
          : errors?.length
          ? 'request_error'
          : 'ok';
        console.log(
          JSON.stringify({
            event: 'graphql_request',
            operation: operation?.operation || 'unknown',
            fields: [
              ...new Set(
                operation?.selectionSet.selections.flatMap(selection =>
                  selection.kind === 'Field' &&
                  knownFields.has(selection.name.value)
                    ? [selection.name.value]
                    : []
                )
              ),
            ],
            outcome,
            durationMs: Date.now() - started,
          })
        );
      },
    };
  },
};

export default loggingPlugin;
