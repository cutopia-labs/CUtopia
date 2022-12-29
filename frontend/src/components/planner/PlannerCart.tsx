import { observer } from 'mobx-react-lite';
import { Checkbox, IconButton, Tooltip } from '@mui/material';
import { ClearAllRounded, Warning } from '@mui/icons-material';
import clsx from 'clsx';
import { FC } from 'react';

import { unescape } from 'lodash';
import styles from '../../styles/components/planner/PlannerCart.module.scss';
import { usePlanner } from '../../store';
import Card from '../atoms/Card';
import ListItem from '../molecules/ListItem';
import { getSectionTime } from '../review/CourseSections';
import {
  CourseSection,
  ErrorCardMode,
  OverlapSection,
  PlannerCourse,
  TbaSection,
} from '../../types';
import ErrorCard from '../molecules/ErrorCard';

const getSectionLabel = (
  course: PlannerCourse,
  overlap: OverlapSection,
  isTba: TbaSection
) => {
  if (overlap) return `Overlap with ${overlap?.name}`;
  if (isTba) return 'TBA Section';
  return unescape(course?.title);
};

type Props = {
  style?: string;
};

const PlannerCart: FC<Props> = ({ style }) => {
  const planner = usePlanner();
  const toggleHide = (
    section: CourseSection,
    index: number,
    sectionKey: string
  ) => {
    planner.updatePlannerSection(
      {
        ...section,
        hide: !section.hide,
      },
      index,
      sectionKey
    );
  };
  return (
    <Card className={clsx(styles.plannerCart, style)}>
      <header className="column">
        <div className="center-row">
          <h3>Cart</h3>
          {Boolean(planner.hidedSections?.length) && (
            <Tooltip title="Clear unchecked sections">
              <IconButton
                onClick={() => planner.removeHidedCourses()}
                size="small"
              >
                <ClearAllRounded />
              </IconButton>
            </Tooltip>
          )}
        </div>
        <div className={clsx(styles.timetableInfoRow, 'row')}>
          <span className="column">
            <span className="sub-title">
              {planner.timetableInfo.totalCredits || 0}
            </span>
            <span className="light-caption">Credits</span>
          </span>
          <span className="column">
            <span className="sub-title">
              {planner.timetableInfo.averageHour.toFixed(2)}
            </span>
            <span className="light-caption">Average Hours</span>
          </span>
        </div>
      </header>
      {planner.plannerCourses?.length ? (
        planner.plannerCourses.map((course, index) =>
          Object.entries(course.sections).map(([k, section], sectionIndex) => {
            const sectionLabel = `${course.courseId} ${section.name}`;
            const overlap = planner.overlapSections[sectionLabel];
            const isTba = planner.timetableInfo.tbaSections[sectionLabel];
            return (
              <ListItem
                key={`cart-${sectionLabel}`}
                title={sectionLabel}
                caption={getSectionTime(section)}
                onClick={() => toggleHide(section, index, k)}
                left={
                  <Tooltip
                    title={getSectionLabel(course, overlap, isTba)}
                    arrow
                    placement="left"
                  >
                    {overlap ? (
                      <Warning
                        className={clsx(
                          styles.alert,
                          styles.plannerCartListIcon
                        )}
                      />
                    ) : (
                      <Checkbox
                        className={styles.plannerCartCheckbox}
                        checked={!section.hide}
                        size="small"
                        disableTouchRipple
                        disableFocusRipple
                        disableRipple
                      />
                    )}
                  </Tooltip>
                }
              />
            );
          })
        )
      ) : (
        <ErrorCard mode={ErrorCardMode.NULL} />
      )}
    </Card>
  );
};

export default observer(PlannerCart);
