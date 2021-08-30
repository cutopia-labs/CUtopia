import {
  createUser,
  verifyUser,
  login,
  resetPassword,
  getResetPasswordCodeAndEmail,
  getUser,
  deleteUser,
  updateDiscussions,
} from './user';
import { setup, teardown } from '../jest/env';
import bcrypt from 'bcryptjs';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { nanoid } from 'nanoid';

describe('User', () => {
  let testUser;

  beforeAll(async () => (testUser = await setup()));

  afterAll(async () => await teardown(testUser));

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

    const { code: resetCode, email } = await getResetPasswordCodeAndEmail({
      username,
    });

    await resetPassword({
      username,
      newPassword: '5678',
      resetCode,
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
        resetCode,
      })
    ).rejects.toThrow(ErrorCode.RESET_PASSWORD_USER_DNE.toString());

    await updateDiscussions({
      username,
      courseId: 'AIST1110',
      text: 'Hello world!',
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1110',
      text: "If it works, then don't touch it",
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1120',
      text: "Developers' job: create bugs, then fix it",
    });

    const user = await getUser({ username });
    const password = await bcrypt.compare('5678', user.password);
    expect(password).toBeTruthy();
    expect(user).toMatchObject({
      username,
      SID,
      verified: true,
      veriCode: null,
      resetPwdCode: null,
      fullAccess: false,
      timetables: [],
      sharedTimetables: [],
      reviewIds: [],
      exp: 0,
      discussions: [
        'AIST1110#Hello world!',
        'AIST1110#If it works, th',
        "AIST1120#Developers' job",
      ],
    });

    await deleteUser({ username });
  });
});
