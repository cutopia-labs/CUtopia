import axios from 'axios';
import HTMLParser from 'fast-html-parser';
import jsonToForm from '../helpers/jsonToForm';
import courseParser from './courseParser';
import { storeData } from '../helpers/store';

export const fetchTerms = async () => {
  const termsRes = await axios.get('https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/SA/c/SSR_STUDENT_FL.SSR_COMPONENT_FL.GBL?Page=SSR_VW_CLASS_FL&ICAJAX=1&ICAGTarget=start&ICAJAXTrf=true&ICPanelControlStyle=pst_side1-open%20pst_panel-mode%20');
  const termsHTML = await termsRes.data;
  const termsDoc = HTMLParser.parse(termsHTML);
  const termsNodes = termsDoc.querySelectorAll('.ps_grid-row.psc_rowact');
  const terms = termsNodes.map(termNode => {
    const aNode = termNode.querySelector('a');
    const termName = aNode.text;
    const actionName = aNode.rawAttributes.href.match(/'.+'/g)[0].replace(/'/g, ''); // React Native does not support positive lookbehind: /(?<=').+(?=')/g ?
    // TODO: define a class for Term?
    return {
      termName,
      actionName,
    };
  });
  if (terms.length > 0) {
    // if user.ICSID is undefined, `terms` is a empty list
    await storeData('terms', JSON.stringify(terms));
  }
  return terms;
};

export const fetchTimeTable = async (ICSID, ICAction) => {
  const data = {
    ICSID,
    ICAction,
    // Unknown keys:
    ICAJAX: 1,
    ICNAVTYPEDROPDOWN: 0,
    ICType: 'Panel',
    ICElementNum: 1,
    ICStateNum: 2,
    ICModelCancel: 0,
    ICXPos: 0,
    ICYPos: 0,
    ResponsetoDiffFrame: -1,
    TargetFrameName: 'None',
    FacetPath: 'None',
    ICFocus: '',
    ICSaveWarningFilter: 0,
    ICChanged: 0,
    ICSkipPending: 0,
    ICAutoSave: 0,
    ICResubmit: 0,
    ICAGTarget: 'true',
    ICActionPrompt: 'false',
    ICBcDomData: '',
    ICDNDSrc: '',
    ICPanelHelpUrl: '',
    ICPanelName: '',
    ICPanelControlStyle: 'pst_side1-openpst_panel-modepst_side2-hidden',
    ICFind: '',
    ICAddCount: '',
    ICAppClsData: '',
  };

  // Need to post twice in order to get the class schedules
  await axios.post('https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/SA/c/SSR_STUDENT_FL.SSR_COMPONENT_FL.GBL', jsonToForm(data));
  const classRes = await axios.post('https://cusis.cuhk.edu.hk/psc/CSPRD/EMPLOYEE/SA/c/SSR_STUDENT_FL.SSR_COMPONENT_FL.GBL', jsonToForm(data));
  const classXML = await classRes.data;
  // console.log(classXML);
  if (classXML.includes('Show Dropped Classes')) {
    const courseList = await courseParser(classXML);
    if (courseList.length) {
      await storeData('courses', JSON.stringify(courseList));
      return courseList;
    }

    return false; // raise error
  }

  return false; // raise error
};
