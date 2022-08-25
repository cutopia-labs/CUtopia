import {
  createUser,
  verifyUser,
  login,
  resetPassword,
  getResetPasswordCodeAndEmail,
  getUser,
  deleteUser,
} from './user';
import { describe, expect, beforeAll, afterAll, it } from '@jest/globals';
import bcrypt from 'bcryptjs';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { nanoid } from 'nanoid';
import { createTestUser, deleteTestUser, setup, teardown } from '../jest/env';
import UserModal from '../models/user';

describe('User', () => {
  let testUser;

  beforeAll(async () => {
    await setup();
    // Empty the user documents
    await UserModal.deleteMany({});
    testUser = await createTestUser();
  });

  afterAll(async () => {
    await deleteTestUser(testUser);
    await teardown();
  });

  it('Register, Verify, Reset Password and Delete', async () => {
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
      username,
      password: '1234',
    });

    const { resetPwdCode } = await getResetPasswordCodeAndEmail({
      username,
    });

    await resetPassword({
      username,
      newPassword: '5678',
      resetCode: resetPwdCode,
    });
    expect(
      resetPassword({
        username,
        newPassword: '5678',
        resetCode: nanoid(5),
      })
    ).rejects.toThrow(ErrorCode.RESET_PASSWORD_FAILED.toString());
    expect(
      resetPassword({
        username: fakeUsername,
        newPassword: '5678',
        resetCode: resetPwdCode,
      })
    ).rejects.toThrow(ErrorCode.RESET_PASSWORD_USER_DNE.toString());

    const user = await getUser({ username });
    const isPasswordCorrect = await bcrypt.compare('5678', user.password);
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
