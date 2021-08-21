import {
  createUser,
  verifyUser,
  login,
  resetPassword,
  getResetPasswordCodeAndEmail,
  getUser,
  deleteUser,
} from './user';
import { connect } from '../';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('User', () => {
  beforeAll(async () => {
    await connect(process.env.ALTAS_DEV_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('Register, Verify, Reset Password and Delete', async () => {
    const veriCode = await createUser({
      username: 'test',
      password: '1234',
      SID: '1155000000',
    });
    // console.log('Created user');

    await verifyUser({
      username: 'test',
      code: veriCode,
    });
    // console.log('Verified user');

    await login({
      username: 'test',
      password: '1234',
    });
    // console.log('Logged in');

    const { code: resetCode, email } = await getResetPasswordCodeAndEmail({
      username: 'test',
    });
    // console.log('Generated reset password');

    await resetPassword({
      username: 'test',
      newPassword: '5678',
      resetCode,
    });
    // console.log('Resetted password');

    const user = await getUser({ username: 'test' });
    const password = await bcrypt.compare('5678', user.password);
    expect(password).toBeTruthy();
    expect(user).toMatchObject({
      username: 'test',
      SID: '1155000000',
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
