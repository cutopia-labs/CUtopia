import { useState, useEffect, Fragment, useContext } from 'react';
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
  BookmarkBorderOutlined,
} from '@material-ui/icons';
import { useQuery } from '@apollo/client';
import { observer } from 'mobx-react-lite';

import { useRouter } from 'next/router';
import styles from '../../styles/components/organisms/SearchPanel.module.scss';
import ListItem from '../molecules/ListItem';
import COURSE_CODES from '../../constants/courseCodes';
import { ViewContext, UserContext } from '../../store';
import { COURSE_SECTIONS_QUERY } from '../../constants/queries';
import { validCourse } from '../../helpers';
import Loading from '../atoms/Loading';
import {
  CURRENT_TERM,
  MAX_SEARCH_RESULT_LENGTH,
} from '../../constants/configs';
import {
  CourseSearchItem,
  ErrorCardMode,
  SearchMode,
  SearchPayload,
} from '../../types';
import UserStore from '../../store/UserStore';
import Card from '../atoms/Card';
import ErrorCard from '../molecules/ErrorCard';
import { getCoursesFromQuery } from '../../helpers/getCourses';
import ChipsRow from '../molecules/ChipsRow';
import useMobileQuery from '../../hooks/useMobileQuery';
import CourseCard from '../review/CourseCard';

type SearchPanelMode = 'review' | 'planner' | 'discussion';

/*
c: courseId
t: title
*/

const LIST_ITEMS = Object.freeze([
  {
    label: 'Pins' as SearchMode,
    icon: <BookmarkBorderOutlined />,
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
  const [results, setResults] = useState<CourseSearchItem[] | null | false>(
    null
  );

  useEffect(() => {
    getCoursesFromQuery({
      payload: searchPayload,
      user,
      limit: limit || MAX_SEARCH_RESULT_LENGTH,
      offerredOnly: searchPayload.offerredOnly,
    }).then(result => {
      setResults(result);
    });
  }, [searchPayload]);

  if (results === null) {
    return <Loading style={styles.searchLoading} />;
  }

  if (!results) {
    return <ErrorCard mode={ErrorCardMode.ERROR} />;
  }

  if (!results.length) {
    return <ErrorCard mode={ErrorCardMode.NULL} />;
  }

  return (
    <>
      {results
        .sort((a, b) => (a.o ? -1 : 1))
        .map((course, i) =>
          searchPayload.showAvalibility && !course.o ? (
            <Tooltip
              title="No information for current semester, please check CUSIS"
              placement="right"
            >
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
              onClick={e => {
                e.stopPropagation();
                onClick ? onClick(course.c) : {};
              }}
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
            onClick={e => {
              e.stopPropagation(); // prevent press icon trigger onClickOutside
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
                  className="search-panel-subject-code"
                  key={code}
                  title={code}
                  ribbonIndex={i}
                  chevron
                  onClick={e => {
                    e.stopPropagation();
                    setSearchPayload({
                      text: code,
                      mode: 'subject',
                    });
                  }}
                />
              ))}
            </div>
          </Collapse>
        </Fragment>
      ))}
    </div>
  );
};

export type SearchPanelProps = {
  searchPayloadProp?: SearchPayload;
  setSearchPayloadProp?: (payload: SearchPayload) => void;
  onCoursePress?: (...args: any[]) => any;
  skipDefaultAction?: boolean;
};

const SearchPanel = ({
  searchPayloadProp,
  setSearchPayloadProp,
  onCoursePress,
  skipDefaultAction,
}: SearchPanelProps) => {
  const [searchPayload, setSearchPayloadState] = useState<SearchPayload | null>(
    searchPayloadProp
  );
  const [currentCourse, setCurrentCourse] = useState(null);
  const router = useRouter();
  const view = useContext(ViewContext);
  const user = useContext(UserContext);
  const isMobile = useMobileQuery();
  const isPlanner = router.pathname.includes('planner');

  useEffect(() => {
    if (currentCourse) {
      document.title = `${currentCourse} Planner - CUtopia`;
    }
  }, [currentCourse]);

  useEffect(() => {
    const courseId = router.query?.courseId as string;
    console.log(`Got ID ${courseId}`);
    if (courseId && validCourse(courseId) && (!onCoursePress || isMobile)) {
      console.log(`Planner Current course ${courseId}`);
      setCurrentCourse(courseId);
    } else {
      setCurrentCourse(null);
    }
  }, [router.query?.courseId, isMobile]);

  // Fetch course info
  const {
    data: courseInfo,
    loading: courseInfoLoading,
    error,
  } = useQuery(COURSE_SECTIONS_QUERY, {
    skip: !currentCourse || !validCourse(currentCourse),
    ...(currentCourse && {
      variables: {
        courseId: currentCourse,
        term: CURRENT_TERM,
      },
    }),
    onError: view.handleError,
  });

  const setSearchPayload = (payload: SearchPayload) => {
    const newPayload = payload
      ? {
          ...payload,
          showAvalibility: Boolean(isPlanner),
          offerredOnly: Boolean(isPlanner),
        }
      : null;
    if (router.query?.courseId) {
      router.push('/planner');
    }
    setSearchPayloadState(newPayload);
    setSearchPayloadProp && setSearchPayloadProp(payload);
  };

  useEffect(() => {
    console.log(COURSE_CODES);
  }, []);

  useEffect(() => {
    if (JSON.stringify(searchPayload) !== JSON.stringify(searchPayloadProp)) {
      setSearchPayload(searchPayloadProp);
    }
  }, [searchPayloadProp]);

  return (
    <Card className="search-panel">
      <div className="search-inputContainer row">
        {(searchPayload &&
          (searchPayload.mode !== 'query' || searchPayload.text)) ||
        currentCourse ? (
          <IconButton
            size="small"
            className="go-back-btn"
            onClick={() => {
              if (!currentCourse) {
                setSearchPayload(null);
              }
              if (isPlanner) {
                router.push('/planner');
              }
            }}
          >
            <ArrowBack />
          </IconButton>
        ) : (
          <div className="search-icon">
            <Search />
          </div>
        )}
        <form className="search-form" onSubmit={e => e.preventDefault()}>
          <InputBase
            className="search-input"
            placeholder="Search…"
            value={searchPayload?.text || ''}
            onChange={e => {
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
      <Divider />
      {!searchPayload && !currentCourse && (
        <Card title="Recents" inPlace className="search-panel-recent">
          <ChipsRow
            className="recent-chips"
            chipClassName="chip-fill"
            items={user.searchHistory.slice(0, 3)}
            onItemClick={(item, e) => {
              e.stopPropagation();
              if (!skipDefaultAction) {
                router.push(`/${isPlanner ? 'planner' : 'review'}/${item}`);
              }
              (!isMobile || !isPlanner) && onCoursePress && onCoursePress(item);
            }}
          />
        </Card>
      )}
      {Boolean(currentCourse) && (
        <>
          {courseInfo && !courseInfoLoading ? (
            <CourseCard
              courseInfo={{
                ...courseInfo.courses[0],
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
            <SearchResult
              searchPayload={searchPayload}
              user={user}
              onClick={courseId => {
                isPlanner && user.saveHistory(courseId);
                if (!skipDefaultAction) {
                  router.push(
                    `/${isPlanner ? 'planner' : 'review'}/${courseId}`
                  );
                }
                onCoursePress &&
                  !(isPlanner && isMobile) &&
                  onCoursePress(courseId);
              }}
            />
          </>
        ) : (
          <>
            {LIST_ITEMS.map(item => (
              <MUIListItem
                key={item.label}
                button
                onClick={e => {
                  if (onCoursePress) {
                    e.stopPropagation(); // prevent e.target showes child node
                  }
                  setSearchPayload({ mode: item.label });
                }}
                className="search-panel-mode-item"
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
