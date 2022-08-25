import { PASSWORD_RULE, SID_RULE, USERNAME_RULE } from 'cutopia-types/lib/rules';

describe('Rule: password', () => {
  it('should reject short length', () => {
    const pwd = '1234567';
    expect(PASSWORD_RULE.test(pwd)).toBe(false);
  });
  it('should reject white space', () => {
    const pwd = '1234567 ';
    expect(PASSWORD_RULE.test(pwd)).toBe(false);
  });
  it('should NOT reject long length', () => {
    const pwd = '123456790123456';

    expect(PASSWORD_RULE.test(pwd)).toBe(true);
  });
  it('should NOT reject special char', () => {
    const pwd = ')*+,-./:;<=>?@[';

    expect(PASSWORD_RULE.test(pwd)).toBe(true);
  });
});

describe('Rule: username', () => {
  it('should reject long length', () => {
    const str = '12345678901';
    expect(USERNAME_RULE.test(str)).toBe(false);
  });
});

describe('Rule: SID', () => {
  it('should reject length > 10', () => {
    const str = '11345678901';
    expect(SID_RULE.test(str)).toBe(false);
  });
  it('should reject length < 10', () => {
    const str = '11345678';
    expect(SID_RULE.test(str)).toBe(false);
  });
  it('should reject non 11 start', () => {
    const str = '1780230430';
    expect(SID_RULE.test(str)).toBe(false);
  });
  it('should NOT reject length of 10 and 11 start', () => {
    const str = '1134567891';
    expect(SID_RULE.test(str)).toBe(true);
  });
});
