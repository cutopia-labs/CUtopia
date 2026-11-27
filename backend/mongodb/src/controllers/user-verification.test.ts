import { ErrorCode } from 'cutopia-types';

import User from '../models/user';

import { verifyUser } from './user';

jest.mock('../models/user', () => ({
  __esModule: true,
  default: {
    findOne: jest.fn(),
    updateOne: jest.fn(() => ({
      exec: jest.fn().mockResolvedValue({ matchedCount: 1 }),
    })),
  },
}));

describe('Verification code renewal', () => {
  beforeEach(() => jest.clearAllMocks());

  it('accepts a renewed code without changing the original registration date', async () => {
    const user = {
      _id: 'recovered-id',
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now(),
      veriCode: 'fresh',
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await verifyUser({ username: 'recovered', code: 'fresh' });

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: user._id, verified: false, veriCode: 'fresh' },
      { $set: { verified: true, veriCode: null } }
    );
  });

  it('rejects the previous code after a renewal', async () => {
    const user = {
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now(),
      veriCode: 'fresh',
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await expect(
      verifyUser({ username: 'recovered', code: 'old' })
    ).rejects.toThrow(ErrorCode.VERIFICATION_FAILED.toString());
    expect(User.updateOne).not.toHaveBeenCalled();
  });

  it('continues to support accounts created before renewal timestamps existed', async () => {
    const user = {
      _id: 'legacy-id',
      verified: false,
      createdAt: Date.now(),
      veriCode: 'first',
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await verifyUser({ username: 'legacy', code: 'first' });

    expect(User.updateOne).toHaveBeenCalledWith(
      { _id: user._id, verified: false, veriCode: 'first' },
      { $set: { verified: true, veriCode: null } }
    );
  });

  it('expires a renewed code after 24 hours', async () => {
    const user = {
      verified: false,
      createdAt: Date.now() - 7 * 86400000,
      veriCodeCreatedAt: Date.now() - 25 * 3600000,
      veriCode: 'fresh',
    };
    (User.findOne as jest.Mock).mockResolvedValue(user);

    await expect(
      verifyUser({ username: 'expired', code: 'fresh' })
    ).rejects.toThrow(ErrorCode.VERIFICATION_EXPIRED.toString());
    expect(User.updateOne).not.toHaveBeenCalled();
  });
});
