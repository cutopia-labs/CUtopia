import Email from '../../mongodb/src/models/email';

jest.mock('dotenv', () => ({ config: jest.fn() }));
jest.mock('mongodb', () => ({
  ...jest.requireActual('mongodb'),
  connect: jest.fn().mockResolvedValue(undefined),
  disconnect: jest.fn().mockResolvedValue(undefined),
  addToResendList: jest.fn(),
  getResendList: jest.fn(),
  removeFromResendList: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./setup', () => ({
  setupEmailer: jest.fn().mockReturnValue([
    {
      sendMail: jest.fn(),
      transporter: { auth: { user: 'test-sender' } },
    },
  ]),
}));

const database = require('mongodb');

const { handler: resend } = require('./resend');
const { setupEmailer } = require('./setup');

const { handler: send } = require('./index');

const transporters = setupEmailer();

const eventFor = message => ({
  Records: [{ Sns: { Message: JSON.stringify(message) } }],
});

describe('Email delivery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    transporters[0].sendMail.mockReset();
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('sends confirmation emails directly to the student', async () => {
    transporters[0].sendMail.mockResolvedValue(undefined);

    await send(
      eventFor({
        action: 'create',
        SID: '1155191624',
        username: 'test-user',
        code: 'abcde',
      })
    );

    expect(transporters[0].sendMail).toHaveBeenCalledWith(
      expect.objectContaining({ to: '1155191624@link.cuhk.edu.hk' })
    );
    expect(database.addToResendList).not.toHaveBeenCalled();
  });

  it.each([
    { action: 'create', username: 'test-user' },
    { action: 'resetPwd', userId: 'test-user' },
  ])(
    'retries failed $action emails with the original recipient and link',
    async fields => {
      const message = { ...fields, SID: '1155191624', code: 'abcde' };
      const queued = new Email(message);
      database.addToResendList.mockImplementation(async input => {
        expect(input).toEqual(message);
        await queued.validate();
      });
      database.getResendList.mockResolvedValue([queued]);
      transporters[0].sendMail.mockRejectedValueOnce(
        new Error('SMTP unavailable')
      );

      await send(eventFor(message));

      expect(database.addToResendList).toHaveBeenCalledWith(message);
      const originalMail = transporters[0].sendMail.mock.calls[0][0];
      transporters[0].sendMail.mockResolvedValue(undefined);

      await resend({});

      expect(transporters[0].sendMail).toHaveBeenLastCalledWith(originalMail);
      expect(originalMail.to).toBe('1155191624@link.cuhk.edu.hk');
      expect(originalMail.html).not.toContain('undefined');
      expect(database.removeFromResendList).toHaveBeenCalledWith(queued);
      expect(database.disconnect).toHaveBeenCalledTimes(2);
    }
  );

  it('does not send or queue a message with a missing recipient', async () => {
    await expect(
      send(eventFor({ action: 'create', username: 'test-user', code: 'abcde' }))
    ).rejects.toThrow('Invalid email recipient SID');

    expect(transporters[0].sendMail).not.toHaveBeenCalled();
    expect(database.addToResendList).not.toHaveBeenCalled();
  });

  it('does not send a queued message with a missing recipient', async () => {
    database.getResendList.mockResolvedValue([
      Email.hydrate({ action: 'create', username: 'test-user', code: 'abcde' }),
    ]);

    await resend({});

    expect(transporters[0].sendMail).not.toHaveBeenCalled();
    expect(database.removeFromResendList).not.toHaveBeenCalled();
    expect(database.disconnect).toHaveBeenCalledTimes(1);
  });
});
