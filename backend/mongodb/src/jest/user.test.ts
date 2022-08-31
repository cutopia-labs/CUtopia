import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { ErrorCode } from 'cutopia-types';
import { nanoid } from 'nanoid';

import {
  createUser,
  verifyUser,
  login,
  resetPassword,
  getResetPasswordCodeAndEmail,
  getUser,
  deleteUser,
} from '../controllers/user';
import UserModal from '../models/user';

import { setup, teardown } from './env';

describe('User', () => {
  beforeAll(async () => {
    await setup();
    // Empty the user documents
    await UserModal.deleteMany({});
  });

  afterAll(teardown);

  it('Register, Verify, Reset Password and Delete User', async () => {
    const username = nanoid(10);
    const fakeUsername = nanoid(10);
    const SID = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    const veriCode = await createUser({
      username,
      password: '1234',
      SID,
    });

    expect(
      verifyUser({
        username,
        code: nanoid(5),
      })
    ).rejects.toThrow(ErrorCode.VERIFICATION_FAILED.toString());
    await verifyUser({
      username,
      code: veriCode,
    });
    expect(
      verifyUser({
        username,
        code: veriCode,
      })
    ).rejects.toThrow(ErrorCode.VERIFICATION_ALREADY_VERIFIED.toString());
    expect(
      verifyUser({
        username: fakeUsername,
        code: nanoid(5),
      })
    ).rejects.toThrow(ErrorCode.VERIFICATION_USER_DNE.toString());

    await login({
      userId: username,
      password: '1234',
    });

    const { resetPwdCode } = await getResetPasswordCodeAndEmail({
      userId: username,
    });

    await resetPassword({
      userId: username,
      newPassword: '5678',
      resetCode: resetPwdCode,
    });
    expect(
      resetPassword({
        userId: username,
        newPassword: '5678',
        resetCode: nanoid(5),
      })
    ).rejects.toThrow(ErrorCode.RESET_PASSWORD_FAILED.toString());
    expect(
      resetPassword({
        userId: fakeUsername,
        newPassword: '5678',
        resetCode: resetPwdCode,
      })
    ).rejects.toThrow(ErrorCode.RESET_PASSWORD_USER_DNE.toString());

    const user = await getUser(username);
    const isPasswordCorrect = await bcrypt.compare('5678', user!.password);
    expect(isPasswordCorrect).toBeTruthy();
    expect(user).toMatchObject({
      username,
      SID,
      verified: true,
      veriCode: null,
      resetPwdCode: null,
      fullAccess: false,
      timetables: [],
      reviewIds: [],
      exp: 0,
    });

    await deleteUser({ username });
  });
});
