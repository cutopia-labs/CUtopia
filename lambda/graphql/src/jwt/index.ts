import jwt from 'jsonwebtoken';
import fs from 'fs';
import { join } from 'path';
const privateKey = fs.readFileSync(join(__dirname, './jwtRS256.key'));
const publicKey = fs.readFileSync(join(__dirname, './jwtRS256.key.pub'));

export const sign = (payload) => {
  const token = jwt.sign(payload, privateKey, { algorithm: 'RS256' });
  return token;
};

export const verify = (token) => {
  try {
    const decoded = jwt.verify(token, publicKey);
    return decoded;
  } catch (e) {
    return null;
  }
};
