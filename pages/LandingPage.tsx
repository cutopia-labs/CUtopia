import { observer } from 'mobx-react-lite';

import Image from 'next/image';
import styles from '../styles/pages/LandingPage.module.scss';
import LoginPanel from '../components/user/LoginPanel';
import Logo from '../components/atoms/Logo';
import useMobileQuery from '../hooks/useMobileQuery';

const LandingPage = () => {
  const isMobile = useMobileQuery();
  return (
    <div className="landing-page">
      {!isMobile && (
        <div className="left column">
          <Logo />
          <h3 className="banner-text">
            Discover the courses that you want & plan your timetable.
          </h3>
          <div className="landing-image-container center-box">
            <Image
              className="landing-image"
              src="/images/meditation.svg"
              alt=""
              draggable={false}
            />
          </div>
        </div>
      )}
      <div className="right column">
        {isMobile && <Logo style={styles.landingLogo} />}
        <LoginPanel className={styles.loginPanel} />
      </div>
    </div>
  );
};

export default observer(LandingPage);
