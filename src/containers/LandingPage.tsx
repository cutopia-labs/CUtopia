import { observer } from 'mobx-react-lite';

import './LandingPage.scss';
import LoginPanel from '../components/user/LoginPanel';
import Logo from '../components/atoms/Logo';
import Illustration from '../images/meditation.svg';
import useMobileQuery from '../helpers/useMobileQuery';

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
            <img
              className="landing-image"
              src={Illustration}
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
