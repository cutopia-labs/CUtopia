import { useState, useEffect, Fragment, useContext } from 'react';
import { useHistory, useParams, useRouteMatch } from 'react-router-dom';
import {
  InputBase,
  ListItem as MUIListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Collapse,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import {
  Search,
  ExpandLess,
  ExpandMore,
  ArrowBack,
  ClassOutlined,
  SchoolOutlined,
  BookmarkBorderOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';

import './SearchPanel.scss';
import ListItem from '../molecules/ListItem';
import { storeData, getStoreData } from '../../helpers/store';
import COURSE_CODES from '../../constants/courseCodes';
import { ViewContext, UserContext } from '../../store';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { validCourse } from '../../helpers/marcos';
import Loading from '../atoms/Loading';
import {
  HISTORY_MAX_LENGTH,
  MAX_SEARCH_RESULT_LENGTH,
} from '../../constants/configs';
import { ErrorCardMode, SearchMode, SearchPayload } from '../../types';
import UserStore from '../../store/UserStore';
import Card from '../atoms/Card';
import ErrorCard from '../molecules/ErrorCard';
import getCoursesFromQuery from '../../helpers/getCoursesFromQuery';
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
}: SearchResultProps) => {
  const results = getCoursesFromQuery({
    payload: searchPayload,
    user,
    limit: limit || MAX_SEARCH_RESULT_LENGTH,
    offerredOnly: searchPayload.offerredOnly,
  });

  if (!results?.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} inPlace />;
  }

  return (
    <>
      {results
        .sort((a, b) => (a.o ? -1 : 1))
        .map((course, i) =>
          searchPayload.showAvalibility && !course.o ? (
            <Tooltip title="Unavaliable for current semester" placement="right">
              <div
                className="list-item-container search-list-item disabled"
                key={`listitem-${course.c}`}
              >
                <div className="list-item-title-container column">
                  <span className="title">{course.c}</span>
                  <span className="caption">{course.t}</span>
                </div>
              </div>
            </Tooltip>
          ) : (
            <ListItem
              className="search-list-item"
              key={`listitem-${course.c}`}
              ribbonIndex={i}
              chevron
              onClick={() => onClick(course.c)}
              onMouseDown={() => (onMouseDown ? onMouseDown(course.c) : {})}
              title={course.c}
              caption={course.t}
            />
          )
        )}
    </>
  );
};

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
                  title={code}
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
  const [searchPayload, setSearchPayloadState] = useState<SearchPayload | null>(
    null
  );
  const [historyList, setHistoryList] = useState([]);
  const [currentCourse, setCurrentCourse] = useState(null);
  const history = useHistory();
  const view = useContext(ViewContext);

  const user = useContext(UserContext);
  const isPlanner = useRouteMatch({
    path: '/planner',
  });
  const { courseId } = useParams<{
    courseId?: string;
  }>();

  useEffect(() => {
    if (validCourse(courseId)) {
      console.log('Current course');
      console.log(courseId);
      setCurrentCourse(courseId);
    }
  }, [courseId]);

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
    onError: view.handleError,
  });

  const setSearchPayload = (payload: SearchPayload) => {
    setSearchPayloadState(
      payload
        ? {
            ...payload,
            showAvalibility: Boolean(isPlanner && payload.mode === 'query'),
            offerredOnly: Boolean(isPlanner),
          }
        : null
    );
  };

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
        {(searchPayload &&
          (searchPayload.mode !== 'query' || searchPayload.text)) ||
        currentCourse ? (
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
                history.push(
                  `/${isPlanner ? 'planner' : 'review'}/${courseId}`
                );
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
