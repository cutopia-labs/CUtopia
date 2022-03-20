import { useState, useContext, FC } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton, Tooltip } from '@material-ui/core';
import { ErrorOutline, Favorite, FavoriteBorder } from '@material-ui/icons';

import { default as RouterLink } from 'next/link';
import { FiExternalLink } from 'react-icons/fi';
import clsx from 'clsx';
import { ReportCategory } from 'cutopia-types/lib/codes';
import styles from '../../styles/components/review/CourseCard.module.scss';
import ShowMoreOverlay from '../molecules/ShowMoreOverlay';
import Badge from '../atoms/Badge';
import { UserContext, ViewContext } from '../../store';
import { COURSE_CARD_MAX_HEIGHT } from '../../constants/configs';
import { CourseInfo } from '../../types';
import Link from '../molecules/Link';
import useMobileQuery from '../../hooks/useMobileQuery';
import Section from '../molecules/Section';
import SectionText from '../molecules/SectionText';
import { CourseCardSkeleton } from '../templates/Skeleton';
import CourseSections from './CourseSections';
import GradeRow from './GradeRow';

type CourseCardProps = {
  courseInfo: CourseInfo;
  concise?: boolean;
  loading?: boolean;
  style?: string;
};

const CourseCard: FC<CourseCardProps> = ({
  courseInfo,
  concise,
  loading,
  style,
}) => {
  const [showMore, setShowMore] = useState(true);
  const [skipHeightCheck, setSkipHeightCheck] = useState(concise);
  const user = useContext(UserContext);
  const isMobile = useMobileQuery();
  const view = useContext(ViewContext);

  if (loading) {
    return CourseCardSkeleton;
  }

  const isFavorited = user.favoriteCourses.some(
    course => course.courseId === courseInfo.courseId
  );

  return (
    <div
      className={clsx(
        styles.courseCard,
        'grid-auto-row',
        concise && styles.concise,
        !showMore && styles.retracted,
        style
      )}
      ref={ref => {
        // Wrap if courseCard is too long
        if (
          !skipHeightCheck &&
          ref &&
          ref.clientHeight >= COURSE_CARD_MAX_HEIGHT
        ) {
          setShowMore(false);
        }
      }}
    >
      <header className={styles.courseCardHeader}>
        <div className={clsx(styles.courseCardTitleContainer, 'column')}>
          <span className="center-row">
            <span className="title">{courseInfo.courseId}</span>
            <IconButton
              className={clsx(isFavorited && 'active')}
              onClick={() => user.toggleFavourite(courseInfo, isFavorited)}
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
          <span className="caption">{courseInfo.title}</span>
        </div>
        {courseInfo.rating && !concise && !isMobile && (
          <GradeRow rating={courseInfo.rating} />
        )}
      </header>
      {concise ? (
        <>
          {courseInfo.requirements && (
            <SectionText
              className={styles.requirementSection}
              title="Requirements"
              caption={courseInfo.requirements}
            />
          )}
          {courseInfo.rating && (
            <>
              <div className={styles.subHeadingContainer}>
                <RouterLink href={`/review/${courseInfo.courseId}`}>
                  <a
                    className={clsx(
                      styles.reviewsLinkHeading,
                      'subHeading center-row'
                    )}
                  >
                    Reviews
                    <FiExternalLink />
                  </a>
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
        <>
          {Boolean(courseInfo?.units) && (
            <div className="badges-row">
              {[
                [
                  courseInfo.units
                    ? `${parseInt(courseInfo.units, 10)} Credits`
                    : undefined,
                ],
                [courseInfo.academic_group],
                ...(Array.isArray(courseInfo.components)
                  ? courseInfo.components
                  : (courseInfo.components || '').match(/[A-Z][a-z]+/g) || []
                ).map(item => item && [item]),
                ...(courseInfo.assessments || []).map(assessment => [
                  assessment.name,
                  parseInt(assessment.percentage, 10) || false,
                ]),
              ]
                .filter(([k, v]) => k !== undefined)
                .map(([k, v], i) => (
                  <Badge index={i} text={k} value={v} key={k + v} />
                ))}
            </div>
          )}
        </>
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
          {Boolean(courseInfo.requirements) && (
            <SectionText
              title={'requirements'}
              caption={courseInfo.requirements}
            />
          )}
          <Section title="Past Paper" subheading>
            <Link
              style={styles.courseLinkContainer}
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