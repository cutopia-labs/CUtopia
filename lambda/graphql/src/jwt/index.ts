import jwt from 'jsonwebtoken';
import fs from 'fs';
import { join } from 'path';
import { getUser } from 'mongodb';
import { ErrorCode } from 'cutopia-types/lib/codes';

const privateKey = fs.readFileSync(join(__dirname, './jwtRS256.key'));
const publicKey = fs.readFileSync(join(__dirname, './jwtRS256.key.pub'));

export interface Token {
  username: string;
  password: string;
}

export const sign = (payload: Token) => {
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  return token;
};

export const verify = async token => {
  try {
    var decoded = jwt.verify(token, publicKey) as Token;
  } catch (e) {
    return null;
  }
  const { username, password } = decoded;
  const user = await getUser(
    { username },
    cachedUser => cachedUser.password !== password
  );
  if (user.password !== password) {
    throw Error(ErrorCode.AUTHORIZATION_PASSWORD_CHANGED.toString());
  }
  return decoded;
};
