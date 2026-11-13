import mongoose from 'mongoose';

import { connect } from '.';

jest.mock('./controllers', () => ({}));
jest.mock('mongoose', () => ({
  connect: jest.fn(),
  connection: { readyState: 0 },
  STATES: { connected: 1 },
}));

it('shares a failed connection attempt and lets the next request reconnect', async () => {
  const open = mongoose.connect as jest.Mock;
  let reject: (error: Error) => void;
  open.mockImplementationOnce(() => new Promise((_, fail) => (reject = fail)));
  const first = connect('mongodb://example.invalid');
  const concurrent = connect('mongodb://example.invalid');
  expect(open).toHaveBeenCalledTimes(1);
  reject(new Error('sensitive driver details'));
  const results = await Promise.allSettled([first, concurrent]);
  for (const result of results) {
    expect(result).toMatchObject({
      status: 'rejected',
      reason: { message: 'Database connection unavailable' },
    });
  }
  open.mockResolvedValueOnce(mongoose);
  await expect(connect('mongodb://example.invalid')).resolves.toBeUndefined();
  expect(open).toHaveBeenCalledTimes(2);
});
