import { Link } from '@material-ui/core';

import './Tab.scss';
import Card from '../../atoms/Card';
import AboutSection from '../AboutSection';

const AboutTab = () => (
  <Card className="about-card row-gap">
    <AboutSection title="About us" labelClassName="about-title sub-heading">
      <p>
        CUtopia is a community for students of The Chinese University of Hong
        Kong. It aims to establish a community that students can share opinions
        towards courses and plan timetable with a nicer UX design. CUHK email
        ending in <b>@link.cuhk.edu.hk</b> is required for registration to
        ensure that all users are CUHK students.
      </p>
      <p>
        CUtopia is a open source project and under development by a team of CUHK
        students. It is still at the development stage, therefore functions are
        incomplete and potentially buggy. Any contribution to the CUtopia
        project is welcomed!
      </p>
    </AboutSection>
    <AboutSection title="Data Source">
      <p>
        The courses information is fetched and parsed from{' '}
        <Link href="http://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx">
          Browse Course Catalog
        </Link>
        . Some information (e.g. assessments) from the data source may not be
        accurate and up-to-date, you are encouraged to double-check the
        information provided by official course page.
      </p>
    </AboutSection>
    <AboutSection title="Contact Us">
      <p>Email: cutopia.team@gmail.com</p>
      <p>
        If you found any bugs or have any suggestion, you may email us or issue
        a report via CUtopia apps.
      </p>
    </AboutSection>
    <AboutSection title="Declaimer">
      <p>
        CUtopia is an independent and unofficial application. It is not
        affiliated with the CUHK.
      </p>
    </AboutSection>
  </Card>
);

export default AboutTab;
