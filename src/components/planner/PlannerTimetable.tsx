import { useContext, useReducer, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerTimetable.scss';
import { useMutation, useQuery } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import { useHistory, useParams } from 'react-router-dom';
import TimetablePanel from '../templates/TimetablePanel';
import { ViewContext, PlannerContext, plannerStore } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { SHARE_TIMETABLE } from '../../constants/mutations';
import {
  Planner,
  PlannerCourse,
  UploadTimetable,
  UploadTimetableResponse,
} from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import TextField from '../atoms/TextField';
import handleCompleted from '../../helpers/handleCompleted';
import { GET_SHARE_TIMETABLE } from '../../constants/queries';
import LoadingButton from '../atoms/LoadingButton';
import Loading from '../atoms/Loading';
import DialogContentTemplate from '../templates/DialogContentTemplate';
import Section from '../molecules/Section';

type PlannerTimetableProps = {
  className?: string;
};

const EXPIRE_LABELS = ['1 day', '3 days', '7 days'];

const SECTIONS = [
  {
    label: 'Expire In',
    chips: EXPIRE_LABELS,
    key: 'expire',
  },
];

const generateShareURL = (uploadTimetable: UploadTimetableResponse) =>
  `${window.location.protocol}//${window.location.host}/planner/share/${uploadTimetable.id}`;

const TimetableShareDialogContent = ({
  shareConfig,
  dispatchShareConfig,
  view,
  onShareTimetTable,
  uploadTimetableLoading,
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
            variant="contained"
            color="inherit"
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
          loading={uploadTimetableLoading}
          className="share loading-btn"
          onClick={onShareTimetTable}
          variant="contained"
        >
          Share
        </LoadingButton>
      </div>
    )}
  </>
);

const SHARE_ID_RULE = new RegExp('^[A-Za-z0-9_-]{8}$', 'i');

const validShareId = (id: string) => id && SHARE_ID_RULE.test(id);

const PlannerTimetable = ({ className }: PlannerTimetableProps) => {
  const { shareId } = useParams<{
    shareId?: string;
  }>();
  const planner = useContext(PlannerContext);
  const history = useHistory();
  const view = useContext(ViewContext);
  const [shareCourses, setShareCourses] = useState<PlannerCourse[] | null>(
    null
  );
  const { loading: getUploadTimetableLoading } = useQuery(GET_SHARE_TIMETABLE, {
    skip: !validShareId(shareId),
    variables: {
      id: shareId,
    },
    onCompleted: async (data: { timetable: UploadTimetable }) => {
      if (planner.validKey(data?.timetable?.createdAt)) {
        view.setSnackBar({
          message: 'Shared planner already loaded!',
          severity: 'warning',
        });
        history.push('/planner');
        return;
      }
      const importedPlanner: Planner = {
        key: data.timetable.createdAt,
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
      history.push('/planner');
    },
    onError: view.handleError,
  });
  const [uploadTimetable, { loading: uploadTimetableLoading }] = useMutation(
    SHARE_TIMETABLE,
    {
      onCompleted: handleCompleted(
        (data) => {
          const uploadTimetable = data?.uploadTimetable;
          if (uploadTimetable && uploadTimetable?.id) {
            const shareURL = generateShareURL(uploadTimetable);
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
        message: 'Empty Timetable, please add some courses before Sharing!',
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
        expire: parseInt(shareConfig.expire[0], 10),
        tableName: planner.currentPlanner?.label,
      };
      console.log(JSON.stringify(data));
      await uploadTimetable({
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
    if (shareId && !validShareId(shareId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
    }
  }, [shareId]);

  return (
    <>
      {getUploadTimetableLoading && <Loading fixed />}
      <TimetablePanel
        className={className}
        courses={planner.plannerCourses?.concat(planner.previewPlannerCourse)}
        timetableInfo={plannerStore.timetableInfo}
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
        <DialogContentTemplate
          title="Share Planner"
          caption={`${
            planner.currentPlanner?.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME
          } (${planner.currentPlanner?.courses?.length} courses)`}
        >
          <TimetableShareDialogContent
            shareConfig={shareConfig}
            dispatchShareConfig={dispatchShareConfig}
            view={view}
            onShareTimetTable={onShareTimetTable}
            uploadTimetableLoading={uploadTimetableLoading}
          />
        </DialogContentTemplate>
      </Dialog>
    </>
  );
};

export default observer(PlannerTimetable);
