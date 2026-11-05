exports.getTemplateByAction = input => {
  // Queued messages are Mongoose documents; spreading them drops schema fields.
  switch (input.action) {
    case 'create':
      return exports.createUserTemplate(input);
    case 'resetPwd':
      return exports.resetPwdTemplate(input);
    default:
      throw new Error('Unsupported email action');
  }
};

const getRecipient = SID => {
  if (typeof SID !== 'string' || !/^11[0-9]{8}$/.test(SID)) {
    throw new Error('Invalid email recipient SID');
  }
  return `${SID}@link.cuhk.edu.hk`;
};

exports.createUserTemplate = ({ SID, username, code }) => ({
  from: 'CUtopia <services@cutopia.app>',
  to: getRecipient(SID),
  subject: 'CUtopia confirmation email',
  html: `Thanks for using CUtopia!<br /><br /> To verify your account, please click 
  <a href='https://cutopia.app/login?mode=verify&username=${username}&code=${code}'>here</a> OR 
manually enter the verification code: <b>${code}</b><br /><br />Regards,<br />CUtopia Team`,
});

exports.resetPwdTemplate = ({ SID, userId, code }) => ({
  from: 'CUtopia <services@cutopia.app>',
  to: getRecipient(SID),
  subject: 'CUtopia reset password',
  html: `To reset your password, please click 
<a href='https://cutopia.app/login?mode=reset-pwd&userId=${userId}&code=${code}'>here</a> OR 
manually enter the code: <b>${code}</b><br /><br />Regards,<br />CUtopia Team`,
});
