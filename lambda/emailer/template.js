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
  html: `Thanks for using CUtopia! To verify your account, please click 
<a href='https://cutopia.app/account/verify?user=${username}&code=${code}'>here</a> OR 
manually enter the verification code: ${code} in the website or mobile app.`,
});

exports.resetPwdTemplate = ({ SID, username, code }) => ({
  from: 'CUtopia <cutopia.app@gmail.com>',
  to: `${SID}@link.cuhk.edu.hk`,
  subject: 'CUtopia reset password',
  html: `To reset your password, please click 
<a href='http://cutopia.app/account/reset-password?user=${username}&code=${code}'>here</a> OR 
manually enter the code: ${code} in the website or mobile app.`,
});
