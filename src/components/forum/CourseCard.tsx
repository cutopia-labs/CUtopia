import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, Tooltip } from '@material-ui/core';
import { ErrorOutline, Favorite, FavoriteBorder } from '@material-ui/icons';

import './CourseCard.scss';
import { useHistory, Link as RouterLink } from 'react-router-dom';
import { FiExternalLink } from 'react-icons/fi';
import clsx from 'clsx';
import { ReportCategory } from 'cutopia-types/lib/codes';
import ShowMoreOverlay from '../molecules/ShowMoreOverlay';
import Badge from '../atoms/Badge';
import { UserContext, ViewContext } from '../../store';
import { COURSE_CARD_MAX_HEIGHT } from '../../constants/configs';
import { CourseInfo } from '../../types';
import Link from '../molecules/Link';
import useMobileQuery from '../../helpers/useMobileQuery';
import Loading from '../atoms/Loading';
import Section from '../molecules/Section';
import SectionText from '../molecules/SectionText';
import Points from './Points';
import CourseSections from './CourseSections';
import GradeRow from './GradeRow';

type CourseCardProps = {
  courseInfo: CourseInfo;
  concise?: boolean;
  loading?: boolean;
};

const CourseCard = ({ courseInfo, concise, loading }: CourseCardProps) => {
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(concise);
  const user = useContext(UserContext);
  const isMobile = useMobileQuery();
  const history = useHistory();
  const view = useContext(ViewContext);

  if (loading) {
    return <Loading />;
  }

  const isFavorited = user.favoriteCourses.some(
    (course) => course.courseId === courseInfo.courseId
  );
  const setFavorited = async () => {
    if (isFavorited) {
      await user.setStore(
        'favoriteCourses',
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
      await user.setStore(
        'favoriteCourses',
        user.favoriteCourses.length ? [...user.favoriteCourses, temp] : [temp]
      );
    }
  };
  return (
    <div
      className={clsx(
        'course-card grid-auto-row',
        concise && 'concise',
        !showMore && 'retracted'
      )}
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
      <header className="course-card-header">
        <div className="center-row">
          <div className="course-card-title-container column">
            <span className="center-row">
              <span className="title">{courseInfo.courseId}</span>
              <IconButton
                className={clsx(isFavorited && 'active')}
                onClick={() => setFavorited()}
                aria-label="favourite"
                size="small"
              >
                {isFavorited ? <Favorite /> : <FavoriteBorder />}
              </IconButton>
              <Tooltip
                title="Report inaccurate information"
                placement="top"
                arrow
              >
                <IconButton
                  onClick={() => {
                    view.setDialog({
                      key: 'reportIssues',
                      contentProps: {
                        reportCategory: ReportCategory.COURSE,
                        id: courseInfo.courseId,
                      },
                    });
                  }}
                  aria-label="report"
                  size="small"
                >
                  <ErrorOutline />
                </IconButton>
              </Tooltip>
              {concise && (
                <Badge
                  className="right"
                  index={0}
                  text={`${parseInt(courseInfo.units, 10)} credits`}
                  value={null}
                />
              )}
            </span>
            <span className="course-title caption">{courseInfo.title}</span>
          </div>
        </div>
        {courseInfo.rating && !concise && !isMobile && (
          <GradeRow rating={courseInfo.rating} />
        )}
      </header>
      {concise ? (
        <>
          {courseInfo.requirements && (
            <SectionText
              className="requirement-section"
              title="Requirements"
              caption={courseInfo.requirements}
            />
          )}
          {courseInfo.rating && (
            <>
              <div className="sub-heading-container">
                <RouterLink
                  to={`/review/${courseInfo.courseId}`}
                  className="reviews-link-heading sub-heading center-row"
                >
                  Reviews
                  <FiExternalLink />
                </RouterLink>
                <GradeRow
                  rating={courseInfo.rating}
                  additionalClassName="concise"
                />
              </div>
            </>
          )}
          <Section title="Sections" subheading>
            <CourseSections courseInfo={courseInfo} />
          </Section>
        </>
      ) : (
        <div className="badges-row course-badge-row">
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
      {!concise && (
        <>
          {['requirements', 'outcome']
            .filter((key) => courseInfo[key] && courseInfo[key] !== '') // filter off empty strings
            .map((key) => (
              <Section key={key} title={key.replaceAll('_', ' ')} subheading>
                <Points text={courseInfo[key]} />
              </Section>
            ))}
          <Section title="Past Paper" subheading>
            <Link
              url={`https://julac.hosted.exlibrisgroup.com/primo-explore/search?query=any,contains,${courseInfo.courseId}&tab=default_tab&search_scope=Exam&sortby=date&vid=CUHK&lang=en_US`}
              label="Search on CUHK library"
            />
          </Section>
        </>
      )}
    </div>
  );
};

export default observer(CourseCard);
