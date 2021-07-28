import { PropsWithChildren, useContext, useReducer, useState } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerTimeTable.scss';
import { useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import clsx from 'clsx';
import TimeTablePanel from '../templates/TimeTablePanel';
import { NotificationContext, PlannerContext } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { SHARE_TIMETABLE } from '../../constants/mutations';
import { PlannerCourse, ShareTimeTable } from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import Loading from '../atoms/Loading';
import TextField from '../atoms/TextField';

type PlannerTimeTableProps = {
  className?: string;
};

enum PlannerTimeTableMode {
  INITIAL,
  SHARE_MODAL,
}

type SectionProps = {
  title: string;
  className?: string;
};

const ANONYMOUS_LABELS = ['Yes', 'No'];

const EXPIRE_LABELS = ['1 day', '3 days', '7 days'];

const SECTIONS = [
  {
    label: 'Anonymous',
    chips: ANONYMOUS_LABELS,
    key: 'anonymous',
  },
  {
    label: 'Expire In',
    chips: EXPIRE_LABELS,
    key: 'expire',
  },
];

const Section = ({
  title,
  children,
  className,
}: PropsWithChildren<SectionProps>) => (
  <div className={clsx('section-container', className)}>
    <div className="label">{title}</div>
    {children}
  </div>
);

const generateShareURL = (sharedTimeTable: ShareTimeTable) =>
  `${window.location.protocol}//${window.location.host}/planner/${sharedTimeTable.id}-${sharedTimeTable.token}`;

const PlannerTimeTable = ({ className }: PlannerTimeTableProps) => {
  const planner = useContext(PlannerContext);
  const notification = useContext(NotificationContext);
  const [mode, setMode] = useState(PlannerTimeTableMode.INITIAL);
  const [shareCourses, setShareCourses] = useState<PlannerCourse[] | null>(
    null
  );
  const [shareTimeTable, { loading: shareTimeTableLoading }] = useMutation(
    SHARE_TIMETABLE,
    {
      onError: notification.handleError,
    }
  );
  const [shareConfig, dispatchShareConfig] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {
      anonymous: 'Yes',
      expire: '7 days',
      shareLink: '',
    }
  );
  const onShareTimetTable = async (e) => {
    e.preventDefault();
    if (!shareCourses?.length) {
      notification.setSnackBar(
        'Empty TimeTable, please add some courses before Sharing!'
      );
    }
    if (shareCourses?.length) {
      const data = {
        entries: shareCourses.map((course) => ({
          ...course,
          sections: Object.values(course.sections),
        })),
        anonymous: shareConfig.anonymous === 'Yes',
        expire: parseInt(shareConfig.expire[0], 10) * 60 * 24,
      };
      const res = await shareTimeTable({
        variables: data,
      });
      const sharedTimeTable = res?.data?.shareTimetable;
      if (sharedTimeTable && sharedTimeTable?.id && sharedTimeTable?.token) {
        const shareURL = generateShareURL(sharedTimeTable);
        dispatchShareConfig({
          shareLink: shareURL,
        });
        console.log(shareURL);
        copy(shareURL);
        notification.setSnackBar('Copied share link to your clipboard!');
      } else {
        notification.setSnackBar({
          message: 'Cannot generate timetable QAQ...',
          severity: 'error',
        });
      }
      console.log(res);
    }
  };

  return (
    <>
      <TimeTablePanel
        className={className}
        courses={planner.plannerCourses}
        previewCourse={planner.previewPlannerCourse}
        onImport={(parsedData) =>
          planner.setStore('plannerCourses', parsedData)
        }
        onClear={() => planner.clearPlannerCourses()}
        onExport={(courses) => setShareCourses(courses)}
        selections={planner.plannerList}
        onSelect={(key) => planner.updateCurrentPlanner(key)}
        selected={{
          key: planner.currentPlanner,
          label:
            planner.planners[planner.currentPlanner]?.label ||
            PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
        }}
        setLabel={(label: string) => planner.setPlannerLabel(label)}
        deleteTable={(key: number) => planner.deletePlanner(key)}
      />
      <Dialog
        className="planner-share-dialog"
        onClose={() => setShareCourses(null)}
        open={Boolean(shareCourses)}
      >
        <div className="content-container grid-auto-row">
          <div className="sub-title">Share Planner</div>
          {SECTIONS.map((section) => (
            <Section title={section.label} key={section.key}>
              <ChipsRow
                items={section.chips}
                select={shareConfig[section.key]}
                setSelect={(item) =>
                  dispatchShareConfig({ [section.key]: item })
                }
              />
            </Section>
          ))}
          {shareConfig.shareLink ? (
            <Section title="Share Link">
              <div className="share-btn-row center-row share-link-row">
                <TextField
                  value={shareConfig.shareLink}
                  onChangeText={() => {}}
                  disabled
                />
                <Button
                  className="copy"
                  onClick={() => copy(shareConfig.shareLink)}
                >
                  Copy
                </Button>
              </div>
            </Section>
          ) : (
            <div className="share-btn-row center-row">
              <Button className="share loading-btn" onClick={onShareTimetTable}>
                {shareTimeTableLoading ? (
                  <Loading padding={false} size={24} />
                ) : (
                  'Share'
                )}
              </Button>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default observer(PlannerTimeTable);
