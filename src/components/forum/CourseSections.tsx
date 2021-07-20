import { useState, useContext } from 'react';
import { observer } from 'mobx-react-lite';
import { IconButton } from '@material-ui/core';
import { Add, PersonOutline, Schedule } from '@material-ui/icons';

import './CourseSections.scss';
import { UserContext } from '../../store';
import { WEEKDAYS_TWO_ABBR } from '../../constants/states';
import { CourseInfo, CourseSection } from '../../types';

type SectionCardProps = {
  section: CourseSection;
  addSection: (section: CourseSection) => void;
  deleteSection: (sectionId) => void;
  added: boolean;
};

const SectionCard = ({
  section,
  addSection,
  deleteSection,
  added,
}: SectionCardProps) => {
  // TODO: Delete if added not yet implemented since plannerCourses observable is not deep enough to observe such change
  const SECTION_CARD_ITEMS = [
    {
      icon: <PersonOutline />,
      val: section.instructors[0],
    },
    {
      icon: <Schedule />,
      val: section.days
        .map(
          (day, i) =>
            `${WEEKDAYS_TWO_ABBR[day]} ${section.startTimes[i]}-${section.endTimes[i]}`
        )
        .join(', '),
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
};

const CourseSections = ({
  courseInfo: { terms: courseTerms, courseId, title },
}: CourseSectionsProps) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTermIndex, setCurrentTermIndex] = useState(
    courseTerms.length - 1
  );
  const user = useContext(UserContext);
  const addToPlanner = (section: CourseSection) => {
    const copy = { ...section };
    delete copy.name;
    user.addToPlannerCourses({
      sections: {
        [section.name]: copy,
      },
      courseId,
      title,
    });
  };
  const deleteInPlanner = (sectionId) => {
    user.deleteSectionInPlannerCourses({ courseId, sectionId });
  };
  return (
    <div className="course-sections">
      <div className="course-section-wrapper">
        <span className="course-term-label">{`${courseTerms[currentTermIndex].name} Sections:`}</span>
        {courseTerms[currentTermIndex].course_sections.map((section) => (
          <SectionCard
            key={section.name}
            addSection={addToPlanner}
            deleteSection={deleteInPlanner}
            added={user.sectionInPlanner(courseId, section.name)}
            section={section}
          />
        ))}
      </div>
    </div>
  );
};

export default observer(CourseSections);
