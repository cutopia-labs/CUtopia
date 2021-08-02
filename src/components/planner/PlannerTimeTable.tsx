import {
  PropsWithChildren,
  useContext,
  useReducer,
  useState,
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerTimeTable.scss';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import clsx from 'clsx';
import { useParams } from 'react-router-dom';
import TimeTablePanel from '../templates/TimeTablePanel';
import { ViewContext, PlannerContext } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { SHARE_TIMETABLE } from '../../constants/mutations';
import {
  Planner,
  PlannerCourse,
  ShareTimeTable,
  ShareTimeTableResponse,
} from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import TextField from '../atoms/TextField';
import handleCompleted from '../../helpers/handleCompleted';
import { GET_SHARE_TIMETABLE } from '../../constants/queries';
import LoadingButton from '../atoms/LoadingButton';
import Loading from '../atoms/Loading';

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

const generateShareURL = (sharedTimeTable: ShareTimeTableResponse) =>
  `${window.location.protocol}//${window.location.host}/planner/${sharedTimeTable.id}`;

const TimeTableShareDialogContent = ({
  shareConfig,
  dispatchShareConfig,
  view,
  onShareTimetTable,
  shareTimeTableLoading,
}) => (
  <>
    {SECTIONS.map((section) => (
      <Section title={section.label} key={section.key}>
        <ChipsRow
          items={section.chips}
          select={shareConfig[section.key]}
          setSelect={(item) => dispatchShareConfig({ [section.key]: item })}
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
            onClick={() => [
              copy(shareConfig.shareLink),
              view.setSnackBar('Copied share link to your clipboard!'),
            ]}
          >
            Copy
          </Button>
        </div>
      </Section>
    ) : (
      <div className="share-btn-row center-row">
        <LoadingButton
          loading={shareTimeTableLoading}
          className="share loading-btn"
          onClick={onShareTimetTable}
        >
          Share
        </LoadingButton>
      </div>
    )}
  </>
);

const validShareId = (id: string) => id && /^[a-zA-Z0-9]{8}$/i.test(id);

const PlannerTimeTable = ({ className }: PlannerTimeTableProps) => {
  const { id: shareTimeTableId } = useParams<{
    id?: string;
  }>();
  const planner = useContext(PlannerContext);
  const view = useContext(ViewContext);
  const [mode, setMode] = useState(PlannerTimeTableMode.INITIAL);
  const [shareCourses, setShareCourses] = useState<PlannerCourse[] | null>(
    null
  );
  const { loading: getShareTimeTableLoading } = useQuery(GET_SHARE_TIMETABLE, {
    skip: !validShareId(shareTimeTableId),
    variables: {
      id: shareTimeTableId,
    },
    onCompleted: async (data: { timetable: ShareTimeTable }) => {
      if (planner.validKey(data?.timetable?.createdDate)) {
        view.setSnackBar({
          message: 'Shared planner already loaded!',
          severity: 'warning',
        });
        return;
      }
      const importedPlanner: Planner = {
        key: data.timetable.createdDate,
        label: data.timetable.tableName,
        courses:
          data.timetable.entries.map((course) => ({
            ...course,
            sections: Object.fromEntries(
              course.sections.map((section) => [section.name, section])
            ),
          })) || [],
      };
      await planner.addPlanner(importedPlanner);
      planner.updateCurrentPlanner(importedPlanner.key);
    },
    onError: view.handleError,
  });
  const [shareTimeTable, { loading: shareTimeTableLoading }] = useMutation(
    SHARE_TIMETABLE,
    {
      onCompleted: handleCompleted(
        (data) => {
          const sharedTimeTable = data?.shareTimetable;
          if (sharedTimeTable && sharedTimeTable?.id) {
            const shareURL = generateShareURL(sharedTimeTable);
            dispatchShareConfig({
              shareLink: shareURL,
            });
            copy(shareURL);
          } else {
            view.setSnackBar({
              message: 'Cannot generate timetable QAQ...',
              severity: 'error',
            });
          }
        },
        {
          view,
          message: 'Copied share link to your clipboard!',
        }
      ),
      onError: view.handleError,
    }
  );
  const [shareConfig, dispatchShareConfig] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {}
  );
  const onShareTimetTable = async (e) => {
    e.preventDefault();
    if (!shareCourses?.length) {
      view.setSnackBar({
        message: 'Empty TimeTable, please add some courses before Sharing!',
        severity: 'error',
      });
    }
    console.table(shareCourses);
    if (shareCourses?.length) {
      const data = {
        entries: shareCourses
          .filter(
            (course) =>
              course &&
              course.sections &&
              Object.values(course.sections)?.length
          )
          .map((course) => ({
            ...course,
            sections: Object.values(course?.sections || {})
              .filter((section) => section && !section.hide)
              .map((section) => {
                const { hide, ...shareSection } = section;
                return shareSection;
              }),
          })),
        expire: parseInt(shareConfig.expire[0], 10) * 60 * 24,
        tableName: planner.currentPlanner.label,
      };
      console.log(JSON.stringify(data));
      await shareTimeTable({
        variables: data,
      });
    }
  };
  useEffect(() => {
    dispatchShareConfig({
      expire: '7 days',
      shareLink: '',
    });
  }, [planner.currentPlannerKey]);

  useEffect(() => {
    if (shareTimeTableId && !validShareId(shareTimeTableId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
    }
  }, [shareTimeTableId]);

  return (
    <>
      {getShareTimeTableLoading && <Loading fixed />}
      <TimeTablePanel
        className={className}
        courses={planner.plannerCourses.concat(planner.previewPlannerCourse)}
        onImport={(parsedData) =>
          planner.setStore('plannerCourses', parsedData)
        }
        onClear={() => planner.clearPlannerCourses()}
        onExport={(courses) => setShareCourses(courses)}
        selections={planner.plannerList}
        onSelect={(key) => planner.updateCurrentPlanner(key)}
        selected={{
          key: planner.currentPlannerKey,
          label:
            planner.currentPlanner?.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
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
          <div className="dialog-caption caption">{`${
            planner.currentPlanner?.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME
          } (${planner.currentPlanner.courses?.length} courses)`}</div>

          <TimeTableShareDialogContent
            shareConfig={shareConfig}
            dispatchShareConfig={dispatchShareConfig}
            view={view}
            onShareTimetTable={onShareTimetTable}
            shareTimeTableLoading={shareTimeTableLoading}
          />
        </div>
      </Dialog>
    </>
  );
};

export default observer(PlannerTimeTable);
