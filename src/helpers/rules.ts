export const USER_ID_RULE = new RegExp(`^11[0-9]{8}$`);
export const USERNAME_RULE = new RegExp(
  `^[A-Za-z0-9\u3000\u3400-\u4DBF\u4E00-\u9FFF]{2,10}$`
);

/*
Contains no space

Allow only alphas + digits + !"#$%&'()*+,-./:;<=>?@[\]^_`{|}~

8 length up
*/

export const PASSWORD_RULE = new RegExp(
  '^[A-Za-z0-9!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~]{8,}$'
);
