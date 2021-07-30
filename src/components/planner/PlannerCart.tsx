import { useContext, useState } from 'react';

import { observer } from 'mobx-react-lite';

import './PlannerCart.scss';
import { Checkbox, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Delete, MoreVert } from '@material-ui/icons';
import { PlannerContext } from '../../store';

import Card from '../atoms/Card';
import ListItem from '../molecules/ListItem';
import { getSectionTime } from '../forum/CourseSections';
import { CourseSection } from '../../types';

const PlannerCart = () => {
  const planner = useContext(PlannerContext);
  const [moreBtnAnchor, setMoreBtnAnchor] = useState(null);
  const toggleHide = (
    section: CourseSection,
    index: number,
    sectionKey: string
  ) => {
    planner.updatePlannerSection(
      {
        ...section,
        hide: !section.hide,
      },
      index,
      sectionKey
    );
  };
  const MORE_SELECTIONS = [
    {
      label: 'Clear hidden courses',
      action: () => planner.removeHidedCourses(),
      icon: <Delete />,
    },
  ];
  return (
    <Card className="planner-cart">
      <header className="planner-cart-header center-row">
        <span className="title">Cart</span>
        <IconButton
          onClick={(e) => setMoreBtnAnchor(e.currentTarget)}
          size="small"
          color="default"
        >
          <MoreVert />
        </IconButton>
      </header>
      {planner.plannerCourses.map((course, index) =>
        Object.entries(course.sections).map(([k, section], sectionIndex) => (
          <ListItem
            key={`cart-${`${course.title} ${section.name}`}`}
            title={`${course.courseId} ${section.name}`}
            caption={getSectionTime(section)}
            onClick={() => toggleHide(section, index, k)}
            left={
              <Checkbox
                className="planner-cart-checkbox"
                checked={!section.hide}
                size="small"
                disableTouchRipple
                disableFocusRipple
                disableRipple
              />
            }
          />
        ))
      )}
      <Menu
        className="timetable-more-menu"
        anchorEl={moreBtnAnchor}
        open={Boolean(moreBtnAnchor)}
        onClose={() => setMoreBtnAnchor(null)}
      >
        {MORE_SELECTIONS.map((item) => (
          <MenuItem
            key={item.label}
            onClick={() => {
              item.action();
              setMoreBtnAnchor(null);
            }}
          >
            <span className="menu-icon-container center-box">{item.icon}</span>
            {item.label}
          </MenuItem>
        ))}
      </Menu>
    </Card>
  );
};

export default observer(PlannerCart);
