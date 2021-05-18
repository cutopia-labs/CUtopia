import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';

import './CoursePanel.css';
import CourseCard from './CourseCard';

export default function CoursePanel({ courseId }) {
  return (
    <div className="course-panel card">
      <CourseCard courseId={courseId} />
    </div>
  );
}
