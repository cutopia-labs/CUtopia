import { Link } from '@material-ui/core';

import './Tab.scss';
import Card from '../../atoms/Card';

const PrivacyTab = () => (
  <Card className="tab-card">
    <div className="section">
      <p className="header">Privacy Policy</p>
      <p className="paragraph">Last updated: Aug 8, 2021</p>
    </div>

    <div className="section">
      <p className="header">Data Collection</p>
      <div className="sub-section">
        <p className="header">CUSIS data</p>
        <p className="paragraph">
          Your CUHK student ID is collected for student verification. You may
          optionally log in your CUSIS to automatically fetch and save your
          timetable locally. Other CUSIS data including name, password and
          address are not collected in any form.
        </p>
      </div>
      <div className="sub-section">
        <p className="header">Errors</p>
        <p className="paragraph">
          Unexpected errors will be reproted to{' '}
          <Link href="https://sentry.io/">Sentry</Link>. This is intended for
          debugging and includes your username as the identifier.
        </p>
      </div>
      <div className="sub-section">
        <p className="header">Analytics</p>
        <p className="paragraph">
          Usage analytics will be collected through{' '}
          <Link href="https://analytics.google.com/">Google Analytics</Link>. It
          is intended for visualizing the page views, session duration, etc.
        </p>
      </div>
    </div>

    <div className="section">
      <p className="header">Data Sharing</p>
      <p className="paragraph">
        We do not share your personal data, such as your CUSIS email, with third
        parties. However, errors and analytics data will be collected through
        Sentry and Google Analytics. Please read their privacy policies for
        further details.
      </p>
    </div>
  </Card>
);

export default PrivacyTab;
