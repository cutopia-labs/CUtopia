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
import { connect } from '../';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

describe('User', () => {
  beforeAll(async () => {
    await connect(process.env.ATLAS_DEV_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Register, Verify, Reset Password and Delete', async () => {
    const username = nanoid(10);
    const SID = Math.floor(1000000000 + Math.random() * 9000000000).toString();
    const veriCode = await createUser({
      username,
      password: '1234',
      SID,
    });
    // console.log('Created user');

    await verifyUser({
      username,
      code: veriCode,
    });
    // console.log('Verified user');

    await login({
      username,
      password: '1234',
    });
    // console.log('Logged in');

    const { code: resetCode, email } = await getResetPasswordCodeAndEmail({
      username,
    });
    // console.log('Generated reset password');

    await resetPassword({
      username,
      newPassword: '5678',
      resetCode,
    });
    // console.log('Resetted password');

    await updateDiscussions({
      username,
      courseId: 'AIST1110',
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1110',
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1120',
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1130',
    });
    await updateDiscussions({
      username,
      courseId: 'AIST1140',
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
      reviews: [],
      exp: 0,
    });

    // await deleteUser({ username: 'test' });
    // console.log('Deleted user');
  });
});
