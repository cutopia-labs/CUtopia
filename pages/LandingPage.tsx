import { observer } from 'mobx-react-lite';

import '../styles/pages/LandingPage.module.scss';
import Image from 'next/image';
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
        {isMobile && <Logo />}
        <LoginPanel />
      </div>
    </div>
  );
};

export default observer(LandingPage);
