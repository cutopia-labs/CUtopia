import React, {
  useState, useEffect, Fragment, useContext,
} from 'react';
import {
  useHistory, useRouteMatch,
} from 'react-router-dom';
import {
  InputBase, ListItem, ListItemIcon, ListItemText, Divider, Chip, Collapse, IconButton,
} from '@material-ui/core';
import {
  Search, ExpandLess, ExpandMore, School, ArrowBack, Bookmark, Class,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';

import './SearchPanel.css';
import MyListItem from '../ListItem';
import { storeData, getStoreData } from '../../helpers/store';
import COURSE_CODES from '../../constants/courseCodes';
import { UserContext } from '../../store';
import COURSES from '../../constants/courses';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { validCourse } from '../../helpers/marcos';
import CourseCard from './CourseCard';
import Loading from '../Loading';

/*
c: courseId
t: title
*/

const HISTORY_MAX_LENGTH = 3;
const MAX_SEARCH_RESULT_LENGTH = 20;

const LIST_ITEMS = Object.freeze([
  {
    label: 'Pins',
    icon: <Bookmark />,
  },
  {
    label: 'My Courses',
    icon: <School />,
  },
]);

const getCoursesFromQuery = (payload, user) => {
  // load local courselist
  const { mode, text } = payload;
  switch (mode) {
    case 'Pins':
      return user.favoriteCourses.map(course => ({
        c: course.courseId,
        t: course.title,
      }));
    case 'My Courses':
      return user.plannerCourses.map(course => ({
        c: course.courseId,
        t: course.title,
      }));
    case 'subject':
      return COURSES[text];
    case 'query':
      const condensed = text.replace(/[^a-zA-Z0-9]/g, '');
      try { // valid search contains suject and code
        const subject = condensed.match(/[a-zA-Z]{4}/)[0].toUpperCase();
        const raw_code = condensed.match(/\d{4}$/) || condensed.match(/\d+/g);
        const code = raw_code ? raw_code[0] : null;
        if (!(subject in COURSES)) {
          throw 'Wrong subject, searching for title';
        }
        if (subject && code) {
          const results = [];
          for (let i = 0; (i < COURSES[subject].length && results.length < MAX_SEARCH_RESULT_LENGTH); i++) {
            if (COURSES[subject][i].c.includes(code)) {
              if (code.length === 4) {
                return [COURSES[subject][i]].slice(0, MAX_SEARCH_RESULT_LENGTH);
              }
              results.push(COURSES[subject][i]);
            }
          }
          return results;
        }
        if (subject) {
          return COURSES[subject].slice(0, MAX_SEARCH_RESULT_LENGTH);
        }
      }
      catch (error) { // search for titles
        const results = [];
        for (const [, courses] of Object.entries(COURSES)) {
          for (let i = 0; (i < courses.length && results.length < MAX_SEARCH_RESULT_LENGTH); i++) {
            if (courses[i].t.toLowerCase().includes(text.toLowerCase())) {
              results.push(courses[i]);
            }
          }
        }
        return results;
      }
      return [];
    default:
      return null;
  }
};

const DepartmentList = ({ setSearchPayload }) => {
  const [currentSchool, setCurrentSchool] = useState();
  return (
    <div className="schools-container">
      {
        Object.entries(COURSE_CODES).map(([k, v]) => (
          <Fragment key={k}>
            <ListItem
              button
              onClick={() => {
                if (k === currentSchool) {
                  setCurrentSchool();
                }
                else {
                  setCurrentSchool(k);
                }
              }}
            >
              <ListItemIcon>
                <Class />
              </ListItemIcon>
              <ListItemText primary={k} />
              {k === currentSchool ? <ExpandLess /> : <ExpandMore />}
            </ListItem>
            <Collapse in={k === currentSchool} timeout="auto" unmountOnExit>
              <div className="code-list">
                {
                  v.map((code, i) => (
                    <MyListItem
                      key={code}
                      label={code}
                      ribbonIndex={i}
                      chevron
                      onClick={() => setSearchPayload({
                        text: code,
                        mode: 'subject',
                      })}
                    />
                  ))
                }
              </div>
            </Collapse>
          </Fragment>
        ))
      }
    </div>
  );
};

const SearchPanel = () => {
  const [searchPayload, setSearchPayload] = useState({});
  const [historyList, setHistoryList] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const history = useHistory();

  const user = useContext(UserContext);
  const isPlanner = useRouteMatch({
    path: '/planner',
    strict: true,
    exact: true,
  });

  // Fetch course info
  const { data: courseInfo, courseInfoLoading, error } = useQuery(COURSE_SECTIONS_QUERY, {
    skip: !currentCourse || !validCourse(currentCourse),
    ...(
      currentCourse
        && {
          variables: {
            subject: currentCourse.substring(0, 4),
            code: currentCourse.substring(4),
          },
        }
    ),
  });

  useEffect(() => {
    console.log(isPlanner);
  }, [isPlanner]);

  useEffect(() => {
    console.log(courseInfo);
  }, [courseInfo]);

  const saveHistory = async courseId => {
    let temp = [...historyList];
    if (temp.length >= HISTORY_MAX_LENGTH) {
      temp.pop();
    }
    temp = [courseId].concat(temp.filter(saved => saved !== courseId));
    setHistoryList(temp);
    await storeData('search_history', JSON.stringify(temp));
  };

  const loadHistory = async () => {
    const savedData = await getStoreData('search_history');
    console.log(savedData);
    if (savedData) {
      setHistoryList(JSON.parse(savedData) || []);
    }
  };

  const deleteHistory = async courseId => {
    const temp = historyList.filter(hist => hist !== courseId);
    setHistoryList(temp);
    await storeData('search_history', JSON.stringify(temp));
  };

  useEffect(() => {
    console.log(COURSE_CODES);
    loadHistory();
  }, []);

  useEffect(() => {
    console.log(historyList);
  }, [historyList]);

  return (
    <div className="search-panel card">
      <div className="search-input-container row">
        {
          Boolean(searchPayload.mode) && (searchPayload.mode !== 'query' || searchPayload.text)
            ? (
              <IconButton
                size="small"
                className="go-back-btn"
                onClick={() => {
                  if (currentCourse) {
                    setCurrentCourse();
                    return;
                  }
                  setSearchPayload({});
                }}
              >
                <ArrowBack />
              </IconButton>
            )
            : (
              <div className="search-icon">
                <Search />
              </div>
            )
        }
        <form
          className="search-form"
          onSubmit={e => e.preventDefault()}
        >
          <InputBase
            className="search-input"
            placeholder="Search…"
            value={searchPayload.text || ''}
            onChange={e => {
              setSearchPayload({
                text: e.target.value,
                mode: 'query',
              });
              setCurrentCourse();
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
        </form>
      </div>
      {
        Boolean(currentCourse) && (
          (courseInfo && !courseInfoLoading)
            ? (
              <CourseCard
                courseInfo={{
                  ...courseInfo.subjects[0].courses[0],
                  courseId: currentCourse,
                }}
                concise
              />
            ) : <Loading />
        )
      }
      {
        !currentCourse
        && (
          searchPayload.mode && (searchPayload.mode !== 'query' || searchPayload.text) ? (
            (getCoursesFromQuery(searchPayload, user) || []).map((course, i) => (
              <MyListItem
                key={`listitem-${course.c}`}
                ribbonIndex={i}
                chevron
                onClick={() => {
                  saveHistory(course.c);
                  if (isPlanner) {
                    setCurrentCourse(course.c);
                  }
                  else {
                    history.push(`/review/${course.c}`);
                  }
                }}
              >
                <div className="search-list-item column">
                  <span className="title">{course.c}</span>
                  <span className="caption">{course.t}</span>
                </div>
              </MyListItem>
            ))
          ) : (
            <>
              {
                Boolean(historyList.length) && (
                  <div className="chips-row">
                    {
                      historyList.map(courseId => (
                        <Chip
                          onClick={() => {
                            if (isPlanner) setCurrentCourse(courseId);
                            else history.push(`/review/${courseId}`);
                          }}
                          variant="outlined"
                          label={courseId}
                          onDelete={() => deleteHistory(courseId)}
                          key={courseId}
                        />
                      ))
                    }
                  </div>
                )
              }
              <Divider />
              {
                LIST_ITEMS.map(item => (
                  <ListItem key={item.label} button onClick={() => setSearchPayload({ mode: item.label })}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.label} />
                  </ListItem>
                ))
              }
              <Divider />
              <DepartmentList setSearchPayload={setSearchPayload} />
            </>
          )
        )
      }
    </div>
  );
};

export default observer(SearchPanel);
