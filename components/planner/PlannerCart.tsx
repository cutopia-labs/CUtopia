import { useContext } from 'react';

import { observer } from 'mobx-react-lite';

import '../../styles/components/planner/PlannerCart.module.scss';
import { Checkbox, IconButton, Tooltip } from '@material-ui/core';
import { ClearAllRounded, Warning } from '@material-ui/icons';
import { PlannerContext } from '../../store';

import Card from '../atoms/Card';
import ListItem from '../molecules/ListItem';
import { getSectionTime } from '../forum/CourseSections';
import { CourseSection, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';

const PlannerCart = () => {
  const planner = useContext(PlannerContext);
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
    <Card className="planner-cart">
      <header className="planner-cart-header column">
        <div className="center-row">
          <h4>Cart</h4>
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
        <div className="timetable-info-row row">
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
            return (
              <ListItem
                key={`cart-${sectionLabel}`}
                title={sectionLabel}
                caption={getSectionTime(section)}
                onClick={() => toggleHide(section, index, k)}
                left={
                  overlap ? (
                    <Tooltip
                      className="planner-cart-list-icon"
                      title={`Overlap with ${overlap.name}`}
                    >
                      <Warning />
                    </Tooltip>
                  ) : (
                    <Checkbox
                      className="planner-cart-checkbox"
                      checked={!section.hide}
                      size="small"
                      disableTouchRipple
                      disableFocusRipple
                      disableRipple
                    />
                  )
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