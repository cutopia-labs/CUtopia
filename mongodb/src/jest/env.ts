import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';

import { connect } from '../';
import { SALT_ROUNDS } from '../constant/configs';
import User from '../models/user.model';

dotenv.config();

export const createTestUser = async () => {
  const now = +new Date();
  const hash = await bcrypt.hash(nanoid(10), SALT_ROUNDS);
  const user = new User({
    username: nanoid(5),
    SID: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
    password: hash,
    createdAt: now,
    verified: true,
  });
  await user.save();
  return user;
};

export const deleteTestUser = async ({ username, SID }) =>
  User.findOneAndDelete({
    username,
    SID,
  });

export const setup = async () => {
  if (process.env.ATLAS_DEV_URI.includes('production')) {
    throw Error(
      "Please make sure that ATLAS_DEV_URI does not contain 'production'."
    );
  }
  await connect(process.env.ATLAS_DEV_URI);
};

export const teardown = async () => await mongoose.connection.close();
