import { useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton } from '@material-ui/core';
import { Add, PersonOutline, Schedule, RoomOutlined } from '@material-ui/icons';

import './CourseSections.scss';
import { PlannerContext, ViewContext } from '../../store';
import { WEEKDAYS_TWO_ABBR } from '../../constants/states';
import { CourseInfo, CourseSection, ErrorCardMode } from '../../types';
import ErrorCard from '../molecules/ErrorCard';
import { CURRENT_TERM } from '../../constants/configs';

type SectionCardProps = {
  section: CourseSection;
  addSection: (section: CourseSection) => void;
  deleteSection: (sectionId) => void;
  added: boolean;
  onAddHoverChange?: (hover: boolean, section: CourseSection) => void;
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

const SectionCard = ({
  section,
  addSection,
  deleteSection,
  added,
  onAddHoverChange,
}: SectionCardProps) => {
  // TODO: Delete if added not yet implemented since plannerCourses observable is not deep enough to observe such change
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
    <div className="course-section-card">
      <span className="section-header course-term-label">
        {section.name}
        <IconButton
          size="small"
          onClick={() => {
            addSection(section);
            // added ? deleteSection(section.name) : addSection(section)
          }}
          onMouseEnter={() => onAddHoverChange(true, section)}
          onMouseLeave={() => onAddHoverChange(false, section)}
        >
          <Add />
          {/* added ? <Delete /> : <Add /> */}
        </IconButton>
      </span>
      <div className="section-detail">
        {SECTION_CARD_ITEMS.map((item) => (
          <div className="section-detail-item" key={item.val}>
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
  onAddHoverChange?: (hover: boolean, courseSection: CourseSection) => void;
};

const CourseSections = ({
  courseInfo: { terms: courseTerms, courseId, title, units },
}: CourseSectionsProps) => {
  const currentTermIndex = (courseTerms || []).findIndex(
    (term) => term.name === CURRENT_TERM
  );
  if (!courseTerms?.length || currentTermIndex === -1) {
    return <ErrorCard mode={ErrorCardMode.NULL} />;
  }
  const planner = useContext(PlannerContext);
  const view = useContext(ViewContext);
  const addToPlanner = (section: CourseSection) => {
    const { name, ...sectionData } = section;
    planner.addToPlannerCourses({
      sections: {
        [name]: section,
      },
      courseId,
      title,
      credit: units,
    });
    view.setSnackBar(`Added ${courseId} ${name}`);
  };
  const deleteInPlanner = (sectionId) => {
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
    <div className="course-sections">
      <div className="course-section-wrapper">
        <span className="course-term-label">{`${courseTerms[currentTermIndex].name}`}</span>
        {courseTerms[currentTermIndex].course_sections.map((section) => (
          <SectionCard
            key={section.name}
            section={section}
            addSection={addToPlanner}
            deleteSection={deleteInPlanner}
            added={planner.sectionInPlanner(courseId, section.name)}
            onAddHoverChange={handlePreviewCourse}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(CourseSections);
