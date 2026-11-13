import { observer } from 'mobx-react-lite';
import { IconButton } from '@mui/material';
import {
  Add,
  PersonOutline,
  Schedule,
  RoomOutlined,
  DeleteOutline,
} from '@mui/icons-material';
import clsx from 'clsx';
import React, { FC } from 'react';

import styles from '../../styles/components/review/CourseSections.module.scss';
import { usePlanner, useView } from '../../store';
import { WEEKDAYS_TWO_ABBR } from '../../constants';
import { CourseInfo, CourseSection, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';

type SectionCardProps = {
  section: CourseSection;
  addSection: (section: CourseSection) => void;
  deleteSection: (sectionId) => void;
  added: boolean;
  onMouseEvent?: (hover: boolean, section: CourseSection) => void;
};

const meetingTime = (section: CourseSection, i: number) => {
  const day = WEEKDAYS_TWO_ABBR[section.days[i]];
  const start = section.startTimes[i];
  const end = section.endTimes[i];
  if (!start || !end || start === 'TBA' || end === 'TBA')
    return day ? `${day} TBA` : 'TBA';
  return `${day || 'TBA'} ${start} - ${end}`;
};

export const getSectionTime = (section: CourseSection) =>
  section.days.map((_, i) => meetingTime(section, i)).join(', ');

const SectionCard: FC<SectionCardProps> = ({
  section,
  addSection,
  deleteSection,
  added,
  onMouseEvent,
}) => {
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
        {!section.days.length && (
          <div className={styles.sectionDetailItem}>Time and location TBA</div>
        )}
        {section.days.map((_, i) => (
          <div className={styles.meeting} key={i}>
            <div className={styles.sectionDetailItem}>
              <Schedule />
              {meetingTime(section, i)}
            </div>
            <div className={styles.sectionDetailItem}>
              <RoomOutlined />
              {section.locations[i]?.trim() || 'Location TBA'}
            </div>
            {section.instructors[i] && (
              <div className={styles.sectionDetailItem}>
                <PersonOutline />
                {section.instructors[i]}
              </div>
            )}
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
  const planner = usePlanner();
  const view = useView();
  if (!courseSections?.length)
    return (
      <ErrorCard
        mode={ErrorCardMode.NULL}
        caption="No information for the selected semester. Try another semester or check CUSIS."
      />
    );
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
