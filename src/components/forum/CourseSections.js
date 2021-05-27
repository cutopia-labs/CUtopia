import React, {
  useState, useEffect, useContext, useRef, useLayoutEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import {
  Divider, IconButton, Button, Menu, MenuItem,
} from '@material-ui/core';
import { Link, useLocation } from 'react-router-dom';
import {
  Add, PersonOutline, Schedule,
} from '@material-ui/icons';

import './CourseSections.css';
import GradeRow from './GradeRow';
import ShowMoreOverlay from '../ShowMoreOverlay';
import Badge from '../Badge';
import { UserContext } from '../../store';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { WEEKDAYS_TWO_ABBR } from '../../constants/states';

const SectionCard = ({ section, addSection }) => {
  const SECTION_CARD_ITEMS = [
    {
      icon: <PersonOutline />,
      val: section.instructors[0],
    },
    {
      icon: <Schedule />,
      val: section.days.map((day, i) => `${WEEKDAYS_TWO_ABBR[day]} ${section.startTimes[i]}-${section.endTimes[i]}`).join(', '),
    },
  ];
  return (
    <div className="course-section-card">
      <span className="section-header course-term-label">
        {section.name}
        <IconButton size="small" onClick={() => addSection(section)}>
          <Add />
        </IconButton>
      </span>
      <div className="section-detail">
        {SECTION_CARD_ITEMS.map(item => (
          <div className="section-detail-item" key={item.val}>
            {item.icon}
            {item.val}
          </div>
        ))}
      </div>
    </div>
  );
};

const CourseSections = ({ courseInfo: { terms: courseTerms, courseId, title } }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentTermIndex, setCurrentTermIndex] = useState(courseTerms.length - 1);
  const user = useContext(UserContext);
  const addToPlanner = section => {
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
  return (
    <div className="course-sections-card">
      <div className="course-section-wrapper">
        <span className="course-term-label">{`${courseTerms[currentTermIndex].name} Sections:`}</span>
        {
          courseTerms[currentTermIndex].course_sections.map(section => <SectionCard addSection={addToPlanner} section={section} />)
        }
      </div>
    </div>
  );
};

export default observer(CourseSections);
