import jwt, { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import { join } from 'path';
import { getUser } from 'mongodb';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { ApolloError } from 'apollo-server-errors';

const privateKey = fs.readFileSync(join(__dirname, './jwtRS256.key'));
const publicKey = fs.readFileSync(join(__dirname, './jwtRS256.key.pub'));

// i.e. if last 6 digits of hashed pwd is same, then user didn't change pwd
const SAME_PASSWORD_THRESHOLD = 6;
export interface Token extends JwtPayload {
  username: string;
  password: string;
}

export const sign = (payload: Token) => {
  payload.password = payload.password.slice(-SAME_PASSWORD_THRESHOLD);
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d',
  });
  return token;
};

export const verify = async token => {
  let decoded: Token;
  try {
    decoded = jwt.verify(token, publicKey, {
      ignoreExpiration: true,
    }) as Token;
  } catch (e) {
    return null;
  }

  if (Date.now() >= decoded.exp * 1000) {
    const { username, password } = decoded;
    const user = await getUser(username, 'password');
    // If pwd not changed, then return refreshed token
    if (user?.password.endsWith(password)) {
      throw new ApolloError(
        'Expired token',
        ErrorCode.AUTHORIZATION_REFRESH_TOKEN.toString(),
        {
          refreshedToken: sign({ username, password }),
        }
      );
    } else {
      throw new ApolloError(
        'Invalid token',
        ErrorCode.AUTHORIZATION_INVALID_TOKEN.toString()
      );
    }
  }
  return decoded;
};
