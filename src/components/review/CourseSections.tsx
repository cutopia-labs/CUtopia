import { observer } from 'mobx-react-lite';
import { IconButton } from '@material-ui/core';
import {
  Add,
  PersonOutline,
  Schedule,
  RoomOutlined,
  DeleteOutline,
} from '@material-ui/icons';
import clsx from 'clsx';
import { FC } from 'react';

import styles from '../../styles/components/review/CourseSections.module.scss';
import { usePlanner, useView } from '../../store';
import { WEEKDAYS_TWO_ABBR } from '../../constants';
import { CourseInfo, CourseSection, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';
import { CURRENT_TERM } from '../../config';

type SectionCardProps = {
  section: CourseSection;
  addSection: (section: CourseSection) => void;
  deleteSection: (sectionId) => void;
  added: boolean;
  onMouseEvent?: (hover: boolean, section: CourseSection) => void;
};

export const getSectionTime = (section: CourseSection) =>
  section.days
    .map(
      (day, i) =>
        `${WEEKDAYS_TWO_ABBR[day] || 'TBA'} ${section.startTimes[i]} - ${
          section.endTimes[i]
        }`
    )
    .join(', ');

const SectionCard: FC<SectionCardProps> = ({
  section,
  addSection,
  deleteSection,
  added,
  onMouseEvent,
}) => {
  const SECTION_CARD_ITEMS = [
    {
      icon: <PersonOutline />,
      val: section.instructors[0],
    },
    {
      icon: <Schedule />,
      val: getSectionTime(section),
    },
    {
      icon: <RoomOutlined />,
      val: section.locations[0],
    },
  ];
  return (
    <div className={styles.courseSectionCard}>
      <span className={clsx(styles.sectionHeader, styles.courseTermLabel)}>
        {section.name}
        <IconButton
          size="small"
          onClick={e => {
            e.stopPropagation();
            added ? deleteSection(section.name) : addSection(section);
          }}
          onMouseEnter={() => !added && onMouseEvent(true, section)}
          onMouseLeave={() => onMouseEvent(false, section)}
        >
          {added ? <DeleteOutline /> : <Add />}
        </IconButton>
      </span>
      <div className={styles.sectionDetail}>
        {SECTION_CARD_ITEMS.map(item => (
          <div className={styles.sectionDetailItem} key={item.val}>
            {item.icon}
            {item.val}
          </div>
        ))}
      </div>
    </div>
  );
};

type CourseSectionsProps = {
  courseInfo: CourseInfo;
  onMouseEvent?: (hover: boolean, courseSection: CourseSection) => void;
};

const CourseSections: FC<CourseSectionsProps> = ({
  courseInfo: { sections: courseSections, courseId, title, units },
}) => {
  if (!courseSections) return <ErrorCard mode={ErrorCardMode.NULL} />;
  const planner = usePlanner();
  const view = useView();
  const addToPlanner = (section: CourseSection) => {
    planner.addToPlannerCourses({
      sections: {
        [section.name]: section,
      },
      courseId,
      title,
      credits: parseInt(units, 10),
    });
    planner.updateStore('previewPlannerCourse', null);
    view.setSnackBar(`Added ${courseId} ${section.name}`);
  };
  const deleteInPlanner = sectionId => {
    planner.deleteSectionInPlannerCourses({ courseId, sectionId });
  };
  const handlePreviewCourse = (hover: boolean, section: CourseSection) => {
    const previewCourse = hover
      ? {
          sections: {
            [section.name]: section,
          },
          courseId,
          title,
        }
      : null;
    planner.updateStore('previewPlannerCourse', previewCourse);
  };
  return (
    <div className={styles.courseSections}>
      <div className={styles.courseSectionWrapper}>
        <span className={styles.courseTermLabel}>{CURRENT_TERM}</span>
        {courseSections.map(section => (
          <SectionCard
            key={section.name}
            section={section}
            addSection={addToPlanner}
            deleteSection={deleteInPlanner}
            added={planner.currentSections.some(
              curSection => curSection.name == section.name
            )}
            onMouseEvent={handlePreviewCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(CourseSections);
