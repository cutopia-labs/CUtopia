import HTMLParser from 'fast-html-parser';
import axios from 'axios';
import jsonToForm from '../helpers/jsonToForm';
import { ERROR_CODES } from '../store/ErrorStore';

export const logout = async () => {
  await axios.get('https://cusis.cuhk.edu.hk/psp/CSPRD/EMPLOYEE/HRMS/?cmd=logout');
  await axios.get('https://cusis.cuhk.edu.hk/mode/cusis.txt');
  await axios.get('https://sts.cuhk.edu.hk/adfs/ls/?wa=wsignout1.0');
};

export const login = async (userId, password, successHandler = () => { }, errorHandler = console.warn, logoutFirst = true) => {
  // TODO: create default error handler for common errors like network unavailable?
  if (logoutFirst) {
    await logout();
  }

  const CUSIS_LOGIN_URL = 'https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/HRMS/c/NUI_FRAMEWORK.PT_LANDINGPAGE.GBL?';

  // Get the redirect url towards universal login panel
  const redirectResponse = await axios.get(CUSIS_LOGIN_URL).catch(errorHandler);
  const redirectResponseUrl = redirectResponse.request?.responseURL;

  if (redirectResponseUrl === CUSIS_LOGIN_URL) {
    // Already logged in
    successHandler();
    return;
  }

  // Login via universal login panel
  const userData = {
    UserName: userId,
    Password: password,
    AuthMethod: 'FormsAuthentication',
  };

  const SAMLResponse = await axios.post(redirectResponseUrl, jsonToForm(userData)).catch(errorHandler);
  const SAMLHTML = await SAMLResponse.data;
  if (SAMLHTML.includes('Incorrect user ID or password. Type the correct user ID and password, and try again.')) {
    errorHandler(ERROR_CODES.LOGIN.INVALID_DATA);
    return;
  }

  // Post the response from universal login panel to the CUSIS
  const html = await SAMLResponse.data;
  const doc = HTMLParser.parse(html);
  const rawResult = doc.querySelectorAll('input');
  const sessionData = {
    SAMLResponse: rawResult[0].rawAttributes.value,
    RelayState: rawResult[1].rawAttributes.value,
  };

  const homepageRes = await axios.post('https://cusis.cuhk.edu.hk/Shibboleth.sso/SAML2/POST', jsonToForm(sessionData)).catch(errorHandler);
  const homepage = await homepageRes.data;
  const homepageDoc = HTMLParser.parse(homepage);
  const ICSID = homepageDoc.querySelector('#ICSID').rawAttributes.value;

  if (sessionData.RelayState !== undefined && ICSID) {
    successHandler(ICSID);
  }
  else {
    errorHandler(ERROR_CODES.PARSER.UNKNOWN);
  }
};
