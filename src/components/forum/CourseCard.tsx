import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, useMediaQuery } from '@material-ui/core';
import { Favorite, FavoriteBorder } from '@material-ui/icons';

import GradeRow from './GradeRow';
import ShowMoreOverlay from '../ShowMoreOverlay';
import Badge from '../Badge';
import { UserContext } from '../../store';
import './CourseCard.css';
import CourseSections from './CourseSections';
import { COURSE_CARD_MAX_HEIGHT } from '../../constants/configs';
import { CourseInfo } from '../../types';

type CourseCardProps = {
  courseInfo: CourseInfo;
  concise?: boolean;
};

const CourseCard = ({ courseInfo, concise }: CourseCardProps) => {
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(concise);
  const user = useContext(UserContext);
  const isMobile = useMediaQuery('(max-width:1260px)');

  const isFavorited = user.favoriteCourses.some(
    (course) => course.courseId === courseInfo.courseId
  );
  const setFavorited = async () => {
    if (isFavorited) {
      await user.saveFavoriteCourses(
        [...user.favoriteCourses].filter(
          (course) => course.courseId !== courseInfo.courseId
        )
      );
    } else {
      console.log('Setting');
      const temp = {
        courseId: courseInfo.courseId,
        title: courseInfo.title,
      };
      await user.saveFavoriteCourses(
        user.favoriteCourses.length ? [...user.favoriteCourses, temp] : [temp]
      );
    }
  };
  return (
    <div
      className={`course-card${concise ? ' concise' : ''}${
        showMore ? '' : ' retracted'
      }`}
      ref={(ref) => {
        // Wrap if course-card is too long
        if (
          !skipHeightCheck &&
          ref &&
          ref.clientHeight >= COURSE_CARD_MAX_HEIGHT
        ) {
          setShowMore(false);
        }
      }}
    >
      <div className="course-card-title-container">
        <div className="center-row">
          <p className="title">{courseInfo.courseId}</p>
          <IconButton
            className={isFavorited ? 'active' : ''}
            onClick={() => setFavorited()}
            aria-label="favourite"
            size="medium"
          >
            {isFavorited ? <Favorite /> : <FavoriteBorder />}
          </IconButton>
        </div>
        {concise && (
          <Badge
            index={0}
            text={`${parseInt(courseInfo.units, 10)} credits`}
            value={null}
          />
        )}
        {courseInfo.rating && !concise && !isMobile && (
          <GradeRow rating={courseInfo.rating} />
        )}
      </div>
      <p className="caption">{courseInfo.title}</p>
      {concise ? (
        <>
          {courseInfo.requirements && (
            <div>
              <p className="sub-heading">Requirements</p>
              <p className="caption">{courseInfo.requirements}</p>
            </div>
          )}
          {courseInfo.rating && (
            <GradeRow
              rating={courseInfo.rating}
              additionalClassName="concise"
            />
          )}
          {courseInfo.terms && <CourseSections courseInfo={courseInfo} />}
        </>
      ) : (
        <div className="course-badge-row">
          {[
            [`${parseInt(courseInfo.units, 10)} Credits`],
            [courseInfo.academic_group],
            ...(Array.isArray(courseInfo.components)
              ? courseInfo.components
              : (courseInfo.components || '').match(/[A-Z][a-z]+/g) || []
            ).map((item) => item && [item]),
            ...(courseInfo.assessments || []).map((assessment) => [
              assessment.name,
              parseInt(assessment.percentage, 10) || false,
            ]),
          ].map(([k, v], i) => (
            <Badge index={i} text={k} value={v} key={k + v} />
          ))}
        </div>
      )}
      {courseInfo.rating && isMobile && !concise && (
        <GradeRow rating={courseInfo.rating} additionalClassName="concise" />
      )}
      {Boolean(courseInfo.description) && (
        <p className="caption description">{courseInfo.description}</p>
      )}
      <ShowMoreOverlay
        visible={!showMore}
        onShowMore={() => [setShowMore(true), setSkipHeightCheck(true)]}
      />
      {!concise &&
        ['requirements', 'outcome', 'required_readings']
          .filter((key) => courseInfo[key] && courseInfo[key] !== '') // filter off empty strings
          .map((key) => (
            <div className="sub-heading-container" key={key}>
              <p className="sub-heading">{key.replace('_', ' ')}</p>
              <p className="caption">{courseInfo[key]}</p>
            </div>
          ))}
    </div>
  );
};

export default observer(CourseCard);
