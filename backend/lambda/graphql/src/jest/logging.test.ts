import loggingPlugin, { formatError } from '../plugins/logging';

it('keeps application codes while excluding raw database errors and input values', async () => {
  const log = jest.spyOn(console, 'log').mockImplementation(() => undefined);
  try {
    const failure = {
      message: 'private connection information',
      originalError: { name: 'MongoServerSelectionError' },
      extensions: {
        code: 'INTERNAL_SERVER_ERROR',
        exception: { secret: 'private' },
      },
    };
    expect(formatError(failure)).toMatchObject({
      message: 'Database temporarily unavailable. Please try again.',
      extensions: { code: 'DATABASE_UNAVAILABLE' },
    });
    expect(
      formatError({ message: '123', extensions: failure.extensions })
    ).toEqual({
      message: '123',
      path: undefined,
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
    const hook = await loggingPlugin.requestDidStart({} as any);
    await hook.willSendResponse({
      operation: {
        operation: 'mutation',
        selectionSet: {
          selections: [{ kind: 'Field', name: { value: 'login' } }],
        },
      },
      request: { variables: { password: 'private', code: 'private' } },
      errors: [failure],
    } as any);
    const line = log.mock.calls[0][0];
    expect(JSON.parse(line)).toMatchObject({
      event: 'graphql_request',
      operation: 'mutation',
      fields: ['login'],
      outcome: 'database_unavailable',
    });
    expect(line).not.toContain('private');
  } finally {
    log.mockRestore();
  }
});
