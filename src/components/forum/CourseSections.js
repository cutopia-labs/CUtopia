import React, {
  useState, useEffect, useContext, useRef, useLayoutEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import { Divider, IconButton } from '@material-ui/core';
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

const SectionCard = ({ section }) => {
  const numOfDays = section.days.length;
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
        <IconButton size="small">
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
      <Divider />
    </div>
  );
};

const CourseSections = ({ courseTerms }) => (
  <div className="course-sections-card">
    {
      courseTerms.map(term => (
        <div className="course-section-wrapper">
          <span className="course-term-label">{term.name}</span>
          <Divider />
          {
            term.course_sections.map(section => <SectionCard section={section} />)
          }
        </div>
      ))
    }
    {
      courseTerms[0].course_sections.map(section => {

      })
    }
  </div>
);

export default observer(CourseSections);
