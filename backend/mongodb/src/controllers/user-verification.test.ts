import { ErrorCode } from 'cutopia-types';

import User from '../models/user';

import { verifyUser } from './user';

jest.mock('../models/user', () => ({
  __esModule: true,
  default: { findOne: jest.fn() },
}));

describe('Verification code renewal', () => {
  it('accepts a renewed code without changing the original registration date', async () => {
    const user = {
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now(),
      veriCode: 'fresh',
      save: jest.fn().mockResolvedValue(undefined),
      remove: jest.fn(),
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await verifyUser({ username: 'recovered', code: 'fresh' });

    expect(user.verified).toBe(true);
    expect(user.veriCode).toBeNull();
    expect(user.remove).not.toHaveBeenCalled();
    expect(user.save).toHaveBeenCalledTimes(1);
  });

  it('rejects the previous code after a renewal', async () => {
    const user = {
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now(),
      veriCode: 'fresh',
      remove: jest.fn(),
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await expect(
      verifyUser({ username: 'recovered', code: 'old' })
    ).rejects.toThrow(ErrorCode.VERIFICATION_FAILED.toString());
    expect(user.remove).not.toHaveBeenCalled();
  });

  it('continues to support accounts created before renewal timestamps existed', async () => {
    const user = {
      verified: false,
      createdAt: Date.now(),
      veriCode: 'first',
      save: jest.fn().mockResolvedValue(undefined),
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await verifyUser({ username: 'legacy', code: 'first' });

    expect(user.verified).toBe(true);
  });

  it('expires a renewed code after 24 hours', async () => {
    const user = {
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now() - 25 * 3600000,
      veriCode: 'fresh',
      remove: jest.fn().mockResolvedValue(undefined),
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await expect(
      verifyUser({ username: 'expired', code: 'fresh' })
    ).rejects.toThrow(ErrorCode.VERIFICATION_EXPIRED.toString());
  });
});
