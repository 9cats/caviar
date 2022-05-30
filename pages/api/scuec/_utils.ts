import { AES, enc, mode, pad } from 'crypto-js';

/* 返回加密后的密码 */
export function encryptPassword(password: string, salt: string) {
  let plain = "ABCD".repeat(16) + password;
  let config = {
    iv: enc.Utf8.parse("ABCD".repeat(4)),
    mode: mode.CBC,
    padding: pad.Pkcs7
  }
  let key = enc.Utf8.parse(salt);

  return AES.encrypt(plain, key, config).toString();
}
