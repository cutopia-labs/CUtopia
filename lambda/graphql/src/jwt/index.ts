import jwt, { JwtPayload } from 'jsonwebtoken';
import fs from 'fs';
import { join } from 'path';
import { getUser } from 'mongodb';
import { ErrorCode } from 'cutopia-types/lib/codes';
import { ApolloError } from 'apollo-server-errors';

const privateKey = fs.readFileSync(join(__dirname, './jwtRS256.key'));
const publicKey = fs.readFileSync(join(__dirname, './jwtRS256.key.pub'));

export interface Token extends JwtPayload {
  username: string;
  password: string;
}

export const sign = (payload: Token) => {
  const token = jwt.sign(payload, privateKey, {
    algorithm: 'RS256',
    expiresIn: '7d',
  });
  return token;
};

export const verify = async token => {
  try {
    var decoded = jwt.verify(token, publicKey, {
      ignoreExpiration: true,
    }) as Token;
  } catch (e) {
    return null;
  }

  if (Date.now() >= decoded.exp * 1000) {
    const { username, password } = decoded;
    const user = await getUser({ username });
    if (user?.password !== password) {
      throw new ApolloError(
        'Invalid token',
        ErrorCode.AUTHORIZATION_INVALID_TOKEN.toString()
      );
    } else {
      throw new ApolloError(
        'Expired token',
        ErrorCode.AUTHORIZATION_REFRESH_TOKEN.toString(),
        {
          refreshedToken: sign({ username, password }),
        }
      );
    }
  }
  return decoded;
};
