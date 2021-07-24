import { useState, useEffect, Fragment, useContext } from 'react';
import { useHistory, useRouteMatch } from 'react-router-dom';
import {
  InputBase,
  ListItem as MUIListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
} from '@material-ui/core';
import {
  Search,
  ExpandLess,
  ExpandMore,
  School,
  ArrowBack,
  Bookmark,
  Class,
  ClassOutlined,
  BookmarkOutlined,
  SchoolOutlined,
  BookmarkBorderOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';

import './SearchPanel.scss';
import ListItem from '../molecules/ListItem';
import { storeData, getStoreData } from '../../helpers/store';
import COURSE_CODES from '../../constants/courseCodes';
import { UserContext } from '../../store';
import COURSES from '../../constants/courses';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { validCourse } from '../../helpers/marcos';
import Loading from '../atoms/Loading';
import {
  HISTORY_MAX_LENGTH,
  MAX_SEARCH_RESULT_LENGTH,
} from '../../constants/configs';
import { CourseSearchItem, SearchMode, SearchPayload } from '../../types';
import UserStore from '../../store/UserStore';
import Card from '../atoms/Card';
import CourseCard from './CourseCard';

/*
c: courseId
t: title
*/

const LIST_ITEMS = Object.freeze([
  {
    label: 'Pins' as SearchMode,
    icon: <BookmarkBorderOutlined />,
  },
  {
    label: 'My Courses' as SearchMode,
    icon: <SchoolOutlined />,
  },
]);

const getCoursesFromQuery = ({
  payload,
  user,
  limit,
}: {
  payload: SearchPayload;
  user?: UserStore;
  limit?: number;
}): CourseSearchItem[] => {
  // load local courselist
  const { mode, text } = payload;
  switch (mode) {
    case 'Pins':
      return user.favoriteCourses.map((course) => ({
        c: course.courseId,
        t: course.title,
      }));
    case 'My Courses':
      return user.timetable.map((course) => ({
        c: course.courseId,
        t: course.title,
      }));
    case 'subject':
      return COURSES[text];
    case 'query':
      const condensed = text.replace(/[^a-zA-Z0-9]/g, '');
      try {
        // valid search contains suject and code
        const subject = condensed.match(/[a-zA-Z]{4}/)[0].toUpperCase();
        const rawCode = condensed.match(/\d{4}$/) || condensed.match(/\d+/g);
        const code = rawCode ? rawCode[0] : null;
        if (!(subject in COURSES)) {
          throw 'Wrong subject, searching for title';
        }
        if (subject && code) {
          const results = [];
          for (
            let i = 0;
            i < COURSES[subject].length && results.length < limit;
            i++
          ) {
            if (COURSES[subject][i].c.includes(code)) {
              if (code.length === 4) {
                return [COURSES[subject][i]].slice(0, limit);
              }
              results.push(COURSES[subject][i]);
            }
          }
          return results;
        }
        if (subject) {
          return COURSES[subject].slice(0, limit);
        }
      } catch (error) {
        // search for titles
        const results = [];
        for (const [, courses] of Object.entries(COURSES)) {
          for (let i = 0; i < courses.length && results.length < limit; i++) {
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

type SearchResultProps = {
  searchPayload: SearchPayload;
  user: UserStore;
  onClick?: (courseId: string) => any;
  onMouseDown?: (courseId: string) => any;
  limit?: number;
};

export const SearchResult = ({
  searchPayload,
  user,
  onClick,
  onMouseDown,
  limit,
}: SearchResultProps) => (
  <>
    {(
      getCoursesFromQuery({
        payload: searchPayload,
        user,
        limit: limit || MAX_SEARCH_RESULT_LENGTH,
      }) || []
    ).map((course, i) => (
      <ListItem
        key={`listitem-${course.c}`}
        ribbonIndex={i}
        chevron
        onClick={() => onClick(course.c)}
        onMouseDown={() => (onMouseDown ? onMouseDown(course.c) : {})}
      >
        <div className="search-list-item column">
          <span className="title">{course.c}</span>
          <span className="caption">{course.t}</span>
        </div>
      </ListItem>
    ))}
  </>
);

const DepartmentList = ({ setSearchPayload }) => {
  const [currentSchool, setCurrentSchool] = useState(null);
  return (
    <div className="schools-container">
      {Object.entries(COURSE_CODES).map(([k, v]) => (
        <Fragment key={k}>
          <MUIListItem
            button
            onClick={() => {
              if (k === currentSchool) {
                setCurrentSchool(null);
              } else {
                setCurrentSchool(k);
              }
            }}
          >
            <ListItemIcon>
              <ClassOutlined />
            </ListItemIcon>
            <ListItemText primary={k} />
            {k === currentSchool ? <ExpandLess /> : <ExpandMore />}
          </MUIListItem>
          <Collapse in={k === currentSchool} timeout="auto" unmountOnExit>
            <div className="code-list">
              {v.map((code, i) => (
                <ListItem
                  key={code}
                  label={code}
                  ribbonIndex={i}
                  chevron
                  onClick={() =>
                    setSearchPayload({
                      text: code,
                      mode: 'subject',
                    })
                  }
                />
              ))}
            </div>
          </Collapse>
        </Fragment>
      ))}
    </div>
  );
};

const SearchPanel = () => {
  const [searchPayload, setSearchPayload] = useState<SearchPayload | null>(
    null
  );
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
  const {
    data: courseInfo,
    loading: courseInfoLoading,
    error,
  } = useQuery(COURSE_SECTIONS_QUERY, {
    skip: !currentCourse || !validCourse(currentCourse),
    ...(currentCourse && {
      variables: {
        subject: currentCourse.substring(0, 4),
        code: currentCourse.substring(4),
      },
    }),
  });

  useEffect(() => {
    console.log(isPlanner);
  }, [isPlanner]);

  useEffect(() => {
    console.log(courseInfo);
  }, [courseInfo]);

  const saveHistory = async (courseId: string) => {
    let temp = [...historyList];
    if (temp.length >= HISTORY_MAX_LENGTH) {
      temp.pop();
    }
    temp = [courseId].concat(temp.filter((saved) => saved !== courseId));
    setHistoryList(temp);
    await storeData('search_history', temp);
  };

  const loadHistory = async () => {
    const savedData = await getStoreData('search_history');
    console.log(savedData);
    if (savedData) {
      setHistoryList(savedData || []);
    }
  };

  const deleteHistory = async (courseId) => {
    const temp = historyList.filter((hist) => hist !== courseId);
    setHistoryList(temp);
    await storeData('search_history', temp);
  };

  useEffect(() => {
    console.log(COURSE_CODES);
    loadHistory();
  }, []);

  useEffect(() => {
    console.log(historyList);
  }, [historyList]);

  return (
    <Card className="search-panel">
      <div className="search-input-container row">
        {searchPayload &&
        (searchPayload.mode !== 'query' || searchPayload.text) ? (
          <IconButton
            size="small"
            className="go-back-btn"
            onClick={() => {
              if (currentCourse) {
                setCurrentCourse(null);
                return;
              }
              setSearchPayload(null);
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <div className="search-icon">
            <Search />
          </div>
        )}
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <InputBase
            className="search-input"
            placeholder="Search…"
            value={searchPayload?.text || ''}
            onChange={(e) => {
              setSearchPayload({
                text: e.target.value,
                mode: 'query',
              });
              setCurrentCourse(null);
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
        </form>
      </div>
      {Boolean(currentCourse) && (
        <>
          <Divider />
          {courseInfo && !courseInfoLoading ? (
            <CourseCard
              courseInfo={{
                ...courseInfo.subjects[0].courses[0],
                courseId: currentCourse,
              }}
              concise
            />
          ) : (
            <Loading />
          )}
        </>
      )}
      {!currentCourse &&
        (searchPayload?.mode &&
        (searchPayload.mode !== 'query' || searchPayload.text) ? (
          <>
            <Divider />
            <SearchResult
              searchPayload={searchPayload}
              user={user}
              onClick={(courseId) => {
                saveHistory(courseId);
                if (isPlanner) {
                  setCurrentCourse(courseId);
                } else {
                  history.push(`/review/${courseId}`);
                }
              }}
            />
          </>
        ) : (
          <>
            <Divider />
            {LIST_ITEMS.map((item) => (
              <MUIListItem
                key={item.label}
                button
                onClick={() => setSearchPayload({ mode: item.label })}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </MUIListItem>
            ))}
            <Divider />
            <DepartmentList setSearchPayload={setSearchPayload} />
          </>
        ))}
    </Card>
  );
};

export default observer(SearchPanel);
