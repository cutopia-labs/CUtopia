import React, {
  useState, useEffect, useContext, useRef, useLayoutEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import IconButton from '@material-ui/core/IconButton';
import {
  ShoppingCart, ShoppingCartOutlined, Favorite, FavoriteOutlined, BarChart, Grade,
} from '@material-ui/icons';

import { RATING_FIELDS } from '../../constants/states';
import GradeIndicator from '../GradeIndicator';
import GradeRow from './GradeRow';
import ShowMoreOverlay from '../ShowMoreOverlay';
import Badge from '../Badge';
import { UserContext } from '../../store';
import './CourseCard.css';

const CourseCard = ({ courseInfo }) => {
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(false);
  const user = useContext(UserContext);

  const isFavorited = user.favoriteCourses.some(course => course.courseId === courseInfo.courseId);
  const setFavorited = async () => {
    if (isFavorited) {
      await user.saveFavoriteCourses([...user.favoriteCourses].filter(course => course.courseId !== courseInfo.courseId));
    }
    else {
      console.log('Setting');
      const temp = {
        courseId: courseInfo.courseId,
        title: courseInfo.title,
      };
      await user.saveFavoriteCourses(user.favoriteCourses.length ? [
        ...user.favoriteCourses,
        temp,
      ] : [temp]);
    }
  };
  return (
    <div
      className="course-card"
      ref={ref => {
        // Wrap if course-card is too long
        if (!skipHeightCheck && ref && ref.clientHeight > window.innerHeight * 0.5) {
          console.log(ref.clientHeight);
          console.log(window.innerHeight);
          setShowMore(false);
        }
      }}
    >
      <div className="course-card-title-container">
        <div className="center-row">
          <p className="title">{courseInfo.courseId}</p>
          <IconButton aria-label="cart" components="span" size="medium">
            <ShoppingCart />
          </IconButton>
          <IconButton
            className={isFavorited ? 'active' : ''}
            onClick={() => setFavorited()}
            aria-label="favourite"
            components="span"
            size="medium"
          >
            <Favorite />
          </IconButton>
        </div>
        <GradeRow rating={courseInfo.rating} />
      </div>
      <p className="caption">{courseInfo.title}</p>
      <div className="course-badge-row">
        {
          [
            [`${parseInt(courseInfo.units, 10)} Credits`],
            [courseInfo.academic_group],
            ...(Array.isArray(courseInfo.components) ? courseInfo.components : (courseInfo.components || '').match(/[A-Z][a-z]+/g)).map(item => [item]),
            ...(courseInfo.assessments || []).map(assessment => [assessment.name, parseInt(assessment.percentage, 10) || false]),
          ].map(([k, v], i) => <Badge index={i} text={k} value={v} key={k + v} />)
        }
      </div>
      <p className="caption description">{courseInfo.description}</p>
      <ShowMoreOverlay
        visible={!showMore}
        onShowMore={() => [setShowMore(true), setSkipHeightCheck(true)]}
      />
      {
        showMore
          && ['outcome', 'syllabus', 'required_readings', 'recommended_readings']
            .filter(key => courseInfo[key] && courseInfo[key] !== '') // filter off empty strings
            .map(key => (
              <div key={key}>
                <p className="sub-heading">{key.replace('_', ' ')}</p>
                <p className="caption">{courseInfo[key]}</p>
              </div>
            ))
      }
    </div>
  );
};

export default observer(CourseCard);
