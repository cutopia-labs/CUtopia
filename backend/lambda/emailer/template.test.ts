import Email from '../../mongodb/src/models/email';

const {
  createUserTemplate,
  getTemplateByAction,
  resetPwdTemplate,
} = require('./template');

const messages = [
  {
    action: 'create',
    SID: '1155191624',
    username: 'test-user',
    code: 'abcde',
  },
  {
    action: 'resetPwd',
    SID: '1155191624',
    userId: 'test-user',
    code: 'fghij',
  },
];

describe('Email templates', () => {
  it.each(messages)(
    'preserves the recipient, account and code when retrying $action emails',
    message => {
      const queued = Email.hydrate(message);
      const mail = getTemplateByAction(queued);

      expect(mail).toEqual(getTemplateByAction(message));
      expect(mail.to).toBe('1155191624@link.cuhk.edu.hk');
      expect(mail.html).toContain(`code=${message.code}`);
      expect(mail.html).toContain(`<b>${message.code}</b>`);
      expect(mail.html).toContain(
        message.action === 'create'
          ? `username=${message.username}`
          : `userId=${message.userId}`
      );
      expect(mail.html).not.toContain('undefined');
    }
  );

  it.each([
    undefined,
    null,
    '',
    'undefined',
    '123',
    'test@example.com',
    1155191624,
  ])('rejects invalid recipient SID %p in both templates', SID => {
    expect(() => createUserTemplate({ ...messages[0], SID })).toThrow(
      'Invalid email recipient SID'
    );
    expect(() => resetPwdTemplate({ ...messages[1], SID })).toThrow(
      'Invalid email recipient SID'
    );
  });

  it('rejects unsupported email actions', () => {
    expect(() =>
      getTemplateByAction({ ...messages[0], action: 'unknown' })
    ).toThrow('Unsupported email action');
  });
});

describe('Queued email schema', () => {
  it.each(messages)(
    'retains the fields needed to retry $action',
    async message => {
      const queued = new Email(message);

      await expect(queued.validate()).resolves.toBeUndefined();
      expect(queued.toObject()).toMatchObject(message);
    }
  );

  it('requires a username for confirmation emails', async () => {
    const queued = new Email({ ...messages[0], username: undefined });

    await expect(queued.validate()).rejects.toThrow('username');
  });

  it('requires a userId for password reset emails', async () => {
    const queued = new Email({ ...messages[1], userId: undefined });

    await expect(queued.validate()).rejects.toThrow('userId');
  });
});
