import React, {
  useState, useEffect, Fragment, useContext,
} from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Paper, InputBase, ListItem, ListItemIcon, ListItemText, Divider, Chip, Collapse, List, IconButton,
} from '@material-ui/core';
import {
  MoveToInbox, Search, ExpandLess, ExpandMore, School, StarBorder, ArrowBack, Bookmark, Class
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { observer } from 'mobx-react-lite';

import './SearchPanel.css';
import MyListItem from '../ListItem';
import { storeData, getStoreData } from '../../helpers/store';
import COURSE_CODES from '../../constants/courseCodes';
import { UserContext } from '../../store';
import COURSES from '../../constants/courses';

const HISTORY_MAX_LENGTH = 10;
const MAX_SEARCH_RESULT_LENGTH = 20;

const getCoursesFromQuery = (payload, user) => {
  // load local courselist
  const { mode } = payload;
  switch (mode) {
    case 'Pins':
      return user.favoriteCourses;
    case 'subject':
      return COURSES[payload.text];
    case 'query':
      const condensed = payload.text.replace(/[^a-zA-Z0-9]/g, '');
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
            if (COURSES[subject][i].courseId.includes(code)) {
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
            if (courses[i].title.toLowerCase().includes(payload.text.toLowerCase())) {
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
  const user = useContext(UserContext);

  const saveHistory = async () => {
    if (searchPayload.text) {
      let temp = [...historyList];
      if (temp.length >= HISTORY_MAX_LENGTH) {
        temp.pop();
      }
      temp = [searchPayload].concat(historyList.filter(history => history.text !== searchPayload.text));
      setHistoryList(temp);
      await storeData('search_history', JSON.stringify(temp));
    }
  };

  const loadHistory = async () => {
    const savedData = await getStoreData('search_history');
    console.log(savedData);
    if (savedData) {
      setHistoryList(JSON.parse(savedData) || []);
    }
  };

  const deleteHistory = async label => {
    const temp = historyList.filter(hist => hist.text !== label);
    setHistoryList(temp);
    await storeData('search_history', JSON.stringify(temp));
  };

  const submitSearch = async () => {
    if (searchPayload.text) {
      console.log(searchPayload);
      await saveHistory(searchPayload);
    }
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
              <IconButton size="small" className="go-back-btn" onClick={() => setSearchPayload({})}>
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
            onChange={e => setSearchPayload({
              text: e.target.value,
              mode: 'query',
            })}
            inputProps={{ 'aria-label': 'search' }}
          />
        </form>
      </div>
      {
        searchPayload.mode && (searchPayload.mode !== 'query' || searchPayload.text) ? (
          (getCoursesFromQuery(searchPayload, user) || []).map((course, i) => (
            <Link key={course.courseId} to={`/review/${course.courseId}`} className="search-list-item-container">
              <MyListItem
                ribbonIndex={i}
                chevron
                onClick={() => {}}
              >
                <div className="search-list-item column">
                  <span className="title">{course.courseId}</span>
                  <span className="caption">{course.title}</span>
                </div>
              </MyListItem>
            </Link>
          ))
        ) : (
          <>
            {
              Boolean(historyList.length) && (
                <div className="chips-row">
                  {
                    historyList.map(history => (
                      <Chip
                        onClick={() => console.log('Hi')}
                        variant="outlined"
                        label={history.text}
                        onDelete={() => deleteHistory(history.text)}
                        key={history}
                      />
                    ))
                  }
                </div>
              )
            }
            <Divider />
            <ListItem button onClick={() => setSearchPayload({ mode: 'Pins' })}>
              <ListItemIcon>
                <Bookmark />
              </ListItemIcon>
              <ListItemText primary="Pins" />
            </ListItem>
            <ListItem button onClick={() => setSearchPayload({ mode: 'My Courses' })}>
              <ListItemIcon>
                <School />
              </ListItemIcon>
              <ListItemText primary="My Courses" />
            </ListItem>
            <Divider />
            <DepartmentList setSearchPayload={setSearchPayload} />
          </>
        )
      }
    </div>
  );
};

export default observer(SearchPanel);
