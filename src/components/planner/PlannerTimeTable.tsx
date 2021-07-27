import { PropsWithChildren, useContext, useReducer, useState } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerTimeTable.scss';
import { useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import TimeTablePanel from '../templates/TimeTablePanel';
import { NotificationContext, PlannerContext } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { SHARE_TIMETABLE } from '../../constants/mutations';
import { PlannerCourse } from '../../types';
import ChipsRow from '../molecules/ChipsRow';

type PlannerTimeTableProps = {
  className?: string;
};

enum PlannerTimeTableMode {
  INITIAL,
  SHARE_MODAL,
}

type SectionProps = {
  title: string;
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

const Section = ({ title, children }: PropsWithChildren<SectionProps>) => (
  <div className="section-container">
    <div className="label">{title}</div>
    {children}
  </div>
);

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
        <div className="grid-auto-row">
          <div className="sub-title">Share</div>
          {SECTIONS.map((section) => (
            <Section title={section.label} key={section.key}>
              <ChipsRow
                variant="default"
                items={section.chips}
                select={shareConfig[section.key]}
                setSelect={(item) =>
                  dispatchShareConfig({ [section.key]: item })
                }
              />
            </Section>
          ))}
          {shareConfig.shareLink ? null : (
            <div className="share-btn-row center-row">
              <Button className="share">Share</Button>
            </div>
          )}
        </div>
      </Dialog>
    </>
  );
};

export default observer(PlannerTimeTable);
