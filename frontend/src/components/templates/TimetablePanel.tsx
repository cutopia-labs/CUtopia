import { FC, useRef } from 'react';
import { IconButton } from '@mui/material';
import { observer } from 'mobx-react-lite';
import copy from 'copy-to-clipboard';
import clsx from 'clsx';
import {
  AiOutlineCamera,
  AiOutlineClear,
  AiOutlineLoading,
  AiOutlineShareAlt,
  AiOutlineSync,
} from 'react-icons/ai';
import html2canvas from 'html2canvas';

import { BiExport } from 'react-icons/bi';
import styles from '../../styles/components/templates/TimetablePanel.module.scss';
import { usePlanner, useView } from '../../store';
import Timetable from '../planner/Timetable';
import Card from '../atoms/Card';

import TimetableOverview, {
  TimetableOverviewProps,
} from '../planner/TimetableOverview';
import { PlannerSyncState } from '../../types';
import { timetable2ics } from '../../helpers/timetable';

type TimetablePanelProps = {
  onShare?: (...args: any[]) => any;
  className?: string;
} & TimetableOverviewProps;

const SYNC_STATE_ICON = {
  [PlannerSyncState.DIRTY]: <AiOutlineSync />,
  [PlannerSyncState.SYNCING]: <AiOutlineLoading className={styles.iconSpin} />,
};

const saveAs = (uri: string, filename: string) => {
  const link = document.createElement('a');
  if (typeof link.download === 'string') {
    link.href = uri;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    window.open(uri);
  }
};

const screenShotTimetable = async (el: HTMLDivElement) => {
  if (!el) return;
  try {
    const canvas = await html2canvas(el, {
      // add styles for the screenshot
      onclone: el => {
        const ttb: any = el.querySelector('.timetable-container');
        if (ttb?.style) {
          ttb.style.padding = '24px';
          ttb.style.backgroundColor = `var(--surface)`;
        }
      },
    });
    const data = canvas.toDataURL();
    saveAs(data, 'cutopia-timetable.png');
  } catch (e) {
    return e;
  }
};

const TimetablePanel: FC<TimetablePanelProps> = ({
  onShare,
  deleteTable,
  className,
  createTimetable,
  switchTimetable,
}) => {
  const view = useView();
  const planner = usePlanner();
  const timetableRef = useRef<HTMLDivElement>();
  const courses = planner.plannerCourses
    ?.concat(planner.previewPlannerCourse)
    .filter(course => course);
  const timetableInfo = planner.timetableInfo;
  const onClear = () => planner.clearPlannerCourses();

  const FUNCTION_BUTTONS = [
    {
      action: async () => {
        try {
          const numCourses = courses.length;
          const ics = timetable2ics(courses);
          // OLD VERSION SUPPORT: if has courses but no event added & no error thrown => courses have no meetingDates
          if (ics.length == 0 && numCourses) {
            return view.warn('Sorry, only NEW timetables are supported');
          }
          const fname = `${planner.plannerName || 'cutopia_timetable'}.ics`;
          const icsFile = ics.getIcsFile(fname);
          const url = URL.createObjectURL(icsFile);
          saveAs(url, fname);
          view.setSnackBar(
            'Calendar file (.ics) saved, use Outlook/Google Calendar to import it~'
          );
        } catch (e) {
          view.warn('Failed to export timetable events QAQ');
        }
      },
      icon: <BiExport />,
      key: 'export',
    },
    {
      action: async () => {
        const err = await screenShotTimetable(timetableRef?.current);
        if (err) {
          view.warn('Failed to screenshot QAQ');
        }
      },
      icon: <AiOutlineCamera />,
      key: 'screenshot',
    },
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
      action: onClear,
      icon: <AiOutlineClear />,
    },
  ];

  return (
    <Card className={clsx(styles.timetablePanel, 'panel column', className)}>
      <header className="center-row">
        <TimetableOverview
          deleteTable={deleteTable}
          createTimetable={createTimetable}
          switchTimetable={switchTimetable}
        />
        {Boolean(courses?.length) && (
          <div className={clsx(styles.btnRow, 'center-row')}>
            {planner.syncState !== PlannerSyncState.SYNCED && (
              <IconButton size="small" disabled>
                {SYNC_STATE_ICON[planner.syncState]}
              </IconButton>
            )}
            {FUNCTION_BUTTONS.map(item => (
              <IconButton key={item.key} size="small" onClick={item.action}>
                {item.icon}
              </IconButton>
            ))}
          </div>
        )}
      </header>
      <Timetable
        ref={timetableRef}
        courses={(courses?.slice() || []) as any}
        timetableInfo={timetableInfo}
      />
    </Card>
  );
};

export default observer(TimetablePanel);
