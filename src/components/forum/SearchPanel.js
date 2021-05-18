import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Paper, InputBase, ListItem, ListItemIcon, ListItemText, Divider, Chip, Collapse, List,
} from '@material-ui/core';
import {
  MoveToInbox, Search, ExpandLess, ExpandMore, School, StarBorder,
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import MyListItem from '../ListItem';

import './SearchPanel.css';
import { storeData, getStoreData } from '../../helpers/store';
import COURSE_CODES from '../../constants/courseCodes';

const HISTORY_MAX_LENGTH = 10;

const useStyles = makeStyles(theme => ({
  root: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: theme.palette.background.paper,
  },
  nested: {
    paddingLeft: theme.spacing(4),
  },
}));

export default function SearchPanel() {
  const classes = useStyles();
  const [search, setSearch] = useState('');
  const [currentSchool, setCurrentSchool] = useState('Business Administration');
  const [historyList, setHistoryList] = useState([]);

  const saveHistory = async () => {
    const sliceIndex = historyList.length <= HISTORY_MAX_LENGTH ? 0 : historyList.length - HISTORY_MAX_LENGTH;
    const temp = [search].concat(historyList.slice(sliceIndex).filter(history => history !== search));
    setHistoryList(temp);
    await storeData('search_history', JSON.stringify(temp));
  };

  const loadHistory = async () => {
    const savedData = await getStoreData('search_history');
    if (savedData) setHistoryList(JSON.parse(savedData || []));
  };

  const deleteHistory = async label => {
    const temp = historyList.filter(hist => hist !== label);
    setHistoryList(temp);
    await storeData('search_history', JSON.stringify(temp));
  };

  const submitSearch = async e => {
    if (e) {
      e.preventDefault();
    }
    if (search) {
      await saveHistory(search);
      console.log(search);
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
        <div className="search-icon">
          <Search />
        </div>
        <form className="search-form" onSubmit={e => submitSearch(e)}>
          <InputBase
            className="search-input"
            placeholder="Search…"
            onChange={e => setSearch(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
          />
        </form>
      </div>
      {
        Boolean(historyList.length) && (
          <div className="chips-row">
            {
              historyList.map(history => (
                <Chip
                  onClick={() => console.log('Hi')}
                  variant="outlined"
                  label={history}
                  onDelete={() => deleteHistory(history)}
                />
              ))
            }
          </div>
        )
      }
      <Divider />
      <ListItem button>
        <ListItemIcon>
          <MoveToInbox />
        </ListItemIcon>
        <ListItemText primary="Pins" />
      </ListItem>
      <ListItem button>
        <ListItemIcon>
          <MoveToInbox />
        </ListItemIcon>
        <ListItemText primary="Pins" />
      </ListItem>
      <Divider />
      <div className="schools-container">
        {
          Object.entries(COURSE_CODES).map(([k, v]) => (
            <>
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
                  <School />
                </ListItemIcon>
                <ListItemText primary={k} />
                {k === currentSchool ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={k === currentSchool} timeout="auto" unmountOnExit>
                <div className="code-list">
                  {
                    v.map((code, i) => (
                      <MyListItem
                        label={code}
                        ribbonIndex={i}
                        chevron
                        onPress={() => {}}
                      />
                    ))
                  }
                </div>
              </Collapse>
            </>
          ))
        }
      </div>
    </div>
  );
}
