import { FC } from 'react';
import { IconButton } from '@material-ui/core';
import { observer } from 'mobx-react-lite';

import copy from 'copy-to-clipboard';
import clsx from 'clsx';
import { AiOutlineDelete, AiOutlineShareAlt } from 'react-icons/ai';
import { usePlanner, useView } from '../../store';
import styles from '../../styles/components/templates/TimetablePanel.module.scss';
import Timetable from '../planner/Timetable';
import Card from '../atoms/Card';

import TimetableOverview, {
  TimetableOverviewProps,
} from '../planner/TimetableOverview';

type TimetablePanelProps = {
  onShare?: (...args: any[]) => any;
  className?: string;
} & TimetableOverviewProps;

const TimetablePanel: FC<TimetablePanelProps> = ({
  onShare,
  deleteTable,
  className,
  createTimetable,
}) => {
  const view = useView();
  const planner = usePlanner();
  const courses = planner.plannerCourses
    ?.concat(planner.previewPlannerCourse)
    .filter(course => course);
  const timetableInfo = planner.timetableInfo;
  const onClear = () => planner.clearPlannerCourses();

  const FUNCTION_BUTTONS = [
    {
      action: () => {
        if (!onShare) {
          const result = copy(JSON.stringify(courses));
          view.setSnackBar(
            result
              ? 'Copied the timetable to clipboard!'
              : 'Failed to copy QAQ, please report the issue to us'
          );
        } else {
          onShare(courses);
        }
      },
      icon: <AiOutlineShareAlt />,
      key: 'share',
    },
    {
      key: 'Clear',
      action: () => {
        onClear();
      },
      icon: <AiOutlineDelete />,
    },
  ];
  return (
    <Card className={clsx(styles.timetablePanel, 'panel column', className)}>
      <header className="center-row">
        <TimetableOverview
          deleteTable={deleteTable}
          createTimetable={createTimetable}
        />
        {Boolean(courses?.length) && (
          <div className={clsx(styles.btnRow, 'center-row')}>
            {FUNCTION_BUTTONS.map(item => (
              <IconButton key={item.key} size="small" onClick={item.action}>
                {item.icon}
              </IconButton>
            ))}
          </div>
        )}
      </header>
      <Timetable
        courses={(courses?.slice() || []) as any}
        timetableInfo={timetableInfo}
      />
    </Card>
  );
};

export default observer(TimetablePanel);
