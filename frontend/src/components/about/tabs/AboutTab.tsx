import { Link } from '@material-ui/core';
import clsx from 'clsx';
import { FC } from 'react';

import { STATICS_EXPIRE_BEFORE } from '../../../config';
import { getMMMDDYY } from '../../../helpers/getTime';
import styles from '../../../styles/components/about/About.module.scss';
import Card from '../../atoms/Card';
import AboutSection from '../AboutSection';

const AboutTab: FC = () => (
  <Card className={clsx(styles.aboutCard, 'rowGap')}>
    <AboutSection
      title="About us"
      labelClassName={clsx(styles.aboutTitle, 'subHeading')}
    >
      <p>
        CUtopia is a community for students of The Chinese University of Hong
        Kong. It aims to establish a community that students can share opinions
        towards courses and plan their timetable. CUHK email ending in{' '}
        <b>@link.cuhk.edu.hk</b> is required for registration to ensure that all
        users are CUHK students.
      </p>
      <p>
        CUtopia is a open source project (will open source after beta test) and
        under development by a team of CUHK students. It is still at the
        development stage, therefore functions are incomplete and potentially
        buggy. Any contribution to the CUtopia project is welcomed!
      </p>
    </AboutSection>
    <AboutSection title="Course Data Source">
      <p className="caption">{`Last batch update date: ${getMMMDDYY(
        STATICS_EXPIRE_BEFORE,
        false,
        false,
        false
      )}`}</p>
      <p>
        The courses information is fetched and parsed from{' '}
        <Link href="http://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx">
          Browse Course Catalog
        </Link>{' '}
        using a{' '}
        <Link href="https://github.com/mikezzb/cuhk-course-scraper">
          parser
        </Link>
        . However, some of the course info is missing (e.g. UGFN, UGFN,
        ELTU2014) from the website. Moreover, some information (e.g.
        assessments) from the data source may not be accurate and up-to-date,
        you are encouraged to double-check the information provided by{' '}
        <Link href="https://cusis.cuhk.edu.hk/">CUSIS</Link>.
      </p>
    </AboutSection>
    <AboutSection title="Contact Us">
      <p>
        Email:{' '}
        <Link href="mailto::cutopia.app@gmail.com">cutopia.app@gmail.com</Link>
      </p>
      <p>
        If you found any bugs or have any suggestion, you may email us or issue
        a report via CUtopia apps.
      </p>
    </AboutSection>
    <AboutSection title="Declaimer">
      <p>
        CUtopia is an independent platform developed by a group of CUHK
        students. It is not affiliated with the CUHK.
      </p>
    </AboutSection>
  </Card>
);

export default AboutTab;
