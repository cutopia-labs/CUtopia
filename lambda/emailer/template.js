exports.getTemplateByAction = input => {
  const { action, ...templateInput } = input;
  switch (action) {
    case 'create':
      return this.createUserTemplate(templateInput);
    case 'resetPwd':
      return this.resetPwdTemplate(templateInput);
  }
};

exports.createUserTemplate = ({ SID, username, code }) => ({
  from: 'CUtopia <cutopia.app@gmail.com>',
  to: `${SID}@link.cuhk.edu.hk`,
  subject: 'CUtopia confirmation email',
  text: `Thanks for using CUtopia! Please click the following link to verify:
https://cutopia.app/account/verify?user=${username}&code=${code}`,
});

exports.resetPwdTemplate = ({ SID, username, code }) => ({
  from: 'CUtopia <cutopia.app@gmail.com>',
  to: `${SID}@link.cuhk.edu.hk`,
  subject: 'CUtopia reset password',
  text: `Please click the following link to reset your password:
http://cutopia.app/account/reset-password?user=${username}&code=${code}`,
});
