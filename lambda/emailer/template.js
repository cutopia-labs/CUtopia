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
  from: 'CUtopia <services@cutopia.app>',
  to: `${SID}@link.cuhk.edu.hk`,
  subject: 'CUtopia confirmation email',
  html: `Thanks for using CUtopia!<br /><br /> To verify your account, please click 
  <a href='https://cutopia.app/login?mode=verify&username=${username}&code=${code}'>here</a> OR 
manually enter the verification code: <b>${code}</b><br /><br />Regards,<br />CUtopia Team`,
});

exports.resetPwdTemplate = ({ SID, userId, code }) => ({
  from: 'CUtopia <services@cutopia.app>',
  to: `${SID}@link.cuhk.edu.hk`,
  subject: 'CUtopia reset password',
  html: `To reset your password, please click 
<a href='https://cutopia.app/login?mode=reset-pwd&userId=${userId}&code=${code}'>here</a> OR 
manually enter the code: <b>${code}</b><br /><br />Regards,<br />CUtopia Team`,
});
