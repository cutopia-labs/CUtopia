/**
 * start w/ 11 + digits only + length of 10
 */
export const SID_RULE = new RegExp(`^11[0-9]{8}$`);

/**
 * Alphanumeric + Chinese Char
 */
export const USERNAME_RULE = new RegExp(
  `^[A-Za-z0-9\u3000\u3400-\u4DBF\u4E00-\u9FFF]{2,10}$`
);

/**
 * Contains no space
 * Allow only alphas + digits + !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~
 * 8 length up
 */
export const PASSWORD_RULE = new RegExp(
  '^[A-Za-z0-9!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~]{8,}$'
);

/**
 * 4 alpha + 4 digit code
 */
export const VALID_COURSE_RULE = new RegExp('^[a-z]{4}\\d{4}$', 'i');
