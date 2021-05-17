import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Paper } from '@material-ui/core';

import './CoursePanel.css';

export default function CoursePanel() {
  const location = useLocation();
  return (
    <div className="course-panel card">
      <div>Hiii</div>
    </div>
  );
}
