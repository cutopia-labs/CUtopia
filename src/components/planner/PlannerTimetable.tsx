import { useContext, useReducer, useState, useEffect } from 'react';
import { observer } from 'mobx-react-lite';

import './PlannerTimetable.scss';
import { useLazyQuery, useMutation } from '@apollo/client';
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
  SnackBarProps,
  UploadTimetable,
} from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import TextField from '../atoms/TextField';
import handleCompleted from '../../helpers/handleCompleted';
import { GET_SHARE_TIMETABLE } from '../../constants/queries';
import LoadingButton from '../atoms/LoadingButton';
import Loading from '../atoms/Loading';
import DialogContentTemplate from '../templates/DialogContentTemplate';
import Section from '../molecules/Section';
import ViewStore from '../../store/ViewStore';

enum ShareTimetableMode {
  UPLOAD, // user persist timetable / persist sharing ttb
  SHARE,
}

type PlannerTimetableProps = {
  className?: string;
};

const getExpire = (str: string) => {
  if (!str) {
    return null;
  }
  if (str.endsWith('day') || str.endsWith('days')) {
    return parseInt(str[0], 10);
  }
  switch (str) {
    case 'Yes':
      return 0;
    case 'No':
      return -1;
  }
  return str;
};

const getLabelFromKey = {
  [0]: 'Yes',
  [-1]: 'No',
};

const EXPIRE_LABELS = ['1 day', '3 days', '7 days'];
const SHAREABLE_LABELS = ['Yes', 'No'];

const SHARE_SECTIONS = [
  {
    label: 'Expire In',
    chips: EXPIRE_LABELS,
    key: 'expire',
  },
];

const UPLOAD_SECTIONS = [
  {
    label: 'Shareable',
    chips: SHAREABLE_LABELS,
    key: 'expire',
  },
];

const MODE_ASSETS = {
  [ShareTimetableMode.SHARE]: {
    sections: SHARE_SECTIONS,
    label: 'share',
    title: 'Share Timetable',
  },
  [ShareTimetableMode.UPLOAD]: {
    sections: UPLOAD_SECTIONS,
    label: 'upload',
    title: 'Upload Timetable',
  },
};

export const generateTimetableURL = (id: string) =>
  `${window.location.protocol}//${window.location.host}/planner/share/${id}`;

const TimetableShareDialogContent = ({
  shareConfig,
  dispatchShareConfig,
  view,
  onShareTimetTable,
  uploadTimetableLoading,
  mode,
}) => (
  <>
    {MODE_ASSETS[mode]?.sections?.map(section => (
      <Section title={section.label} key={section.key}>
        <ChipsRow
          items={section.chips}
          select={
            getLabelFromKey[shareConfig[section.key]] ||
            shareConfig[section.key]
          }
          setSelect={item => dispatchShareConfig({ [section.key]: item })}
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
          {MODE_ASSETS[mode]?.label}
        </LoadingButton>
      </div>
    )}
  </>
);

const SHARE_ID_RULE = new RegExp('^[A-Za-z0-9_-]{8}$', 'i');

const validShareId = (id: string) => id && SHARE_ID_RULE.test(id);

const getSnackbarMessage = (
  shareId: string,
  view: ViewStore,
  message?: string
): SnackBarProps => ({
  severity: 'warning',
  message: message || 'Timetable already uploaded',
  label: 'Share',
  onClick: () => {
    copy(generateTimetableURL(shareId));
    view.setSnackBar('Copied shared link!');
  },
});

const PlannerTimetable = ({ className }: PlannerTimetableProps) => {
  const { shareId } = useParams<{
    shareId?: string;
  }>();
  const planner = useContext(PlannerContext);
  const history = useHistory();
  const view = useContext(ViewContext);
  const [shareCourses, setShareCourses] = useState<{
    courses: PlannerCourse[];
    mode: ShareTimetableMode;
    key: number;
  } | null>(null);
  const [shareConfig, dispatchShareConfig] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {}
  );

  const [getShareTimetable, { loading: getUploadTimetableLoading }] =
    useLazyQuery(GET_SHARE_TIMETABLE, {
      onCompleted: async (data: { timetable: UploadTimetable }) => {
        console.log(`loaded ${data?.timetable}`);
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
          shareId,
          courses:
            data.timetable.entries.map(course => ({
              ...course,
              sections: Object.fromEntries(
                course.sections.map(section => [section.name, section])
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
        data => {
          const uploadTimetable = data?.uploadTimetable;
          if (getExpire(shareConfig?.expire) === -1) {
            planner.updatePlannerShareId(shareCourses.key, uploadTimetable?.id);
            setShareCourses(null);
            return;
          }
          if (uploadTimetable && uploadTimetable?.id) {
            planner.updatePlannerShareId(shareCourses.key, uploadTimetable?.id);
            const shareURL = generateTimetableURL(uploadTimetable?.id);
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
          message:
            getExpire(shareConfig?.expire) === -1
              ? 'Uploaded!'
              : 'Copied share link to your clipboard!',
        }
      ),
      onError: view.handleError,
    }
  );

  const onShareTimetTable = async e => {
    e.preventDefault();
    console.table(shareCourses);
    if (!shareCourses?.courses?.length) {
      return view.setSnackBar({
        severity: 'warning',
        message: 'Empty timetable!',
      });
    }
    const prevShareId = planner.planners[shareCourses.key].shareId;
    if (prevShareId) {
      setShareCourses(null);
      return view.setSnackBar(getSnackbarMessage(prevShareId, view));
    }
    if (shareCourses?.courses?.length) {
      const data = {
        entries: shareCourses.courses
          .filter(
            course =>
              course &&
              course.sections &&
              Object.values(course.sections)?.length
          )
          .map(course => ({
            ...course,
            sections: Object.values(course?.sections || {})
              .filter(section => section && !section.hide)
              .map(section => {
                const { hide, ...shareSection } = section;
                return shareSection;
              }),
          })),
        expire: getExpire(shareConfig.expire),
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
      expire: shareCourses?.mode === ShareTimetableMode.SHARE ? '7 days' : 'No',
      shareLink: '',
    });
  }, [planner.currentPlannerKey, shareCourses]);

  useEffect(() => {
    if (!shareId) {
      return;
    }
    if (!validShareId(shareId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
      return;
    }
    console.log('shareIds');
    console.log(planner.shareIds);
    if (planner.shareIds[shareId]) {
      console.log(
        `Found shareId ${shareId}, skipped loading and switch to ${planner.shareIds[shareId]}`
      );
      planner.updateCurrentPlanner(+planner.shareIds[shareId]);
      history.push('/planner');
      return;
    }
    getShareTimetable({
      variables: {
        id: shareId,
      },
    });
  }, [shareId, planner]);

  return (
    <>
      {getUploadTimetableLoading && <Loading fixed />}
      <TimetablePanel
        className={className}
        courses={planner.plannerCourses
          ?.concat(planner.previewPlannerCourse)
          .filter(course => course)}
        timetableInfo={plannerStore.timetableInfo}
        onImport={parsedData => planner.setStore('plannerCourses', parsedData)}
        onClear={() => planner.clearPlannerCourses()}
        onUpload={courses =>
          setShareCourses({
            courses: courses,
            mode: ShareTimetableMode.UPLOAD,
            key: planner.currentPlannerKey,
          })
        }
        onShare={courses =>
          setShareCourses({
            courses: courses,
            mode: ShareTimetableMode.SHARE,
            key: planner.currentPlannerKey,
          })
        }
        selections={planner.plannerList}
        onSelect={key => planner.updateCurrentPlanner(key)}
        selected={{
          key: planner.currentPlannerKey,
          label:
            planner.currentPlanner?.label || PLANNER_CONFIGS.DEFAULT_TABLE_NAME,
        }}
        setLabel={(label: string) => planner.setPlannerLabel(label)}
        deleteTable={(key: number) => planner.deletePlanner(key)}
      />
      <Dialog
        transitionDuration={{
          enter: 120,
          exit: 0,
        }}
        className="planner-share-dialog"
        onClose={() => setShareCourses(null)}
        TransitionProps={{
          onExited: () => setShareCourses(null),
        }}
        open={Boolean(shareCourses)}
      >
        <DialogContentTemplate
          title={MODE_ASSETS[shareCourses?.mode]?.title}
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
            mode={shareCourses?.mode}
          />
        </DialogContentTemplate>
      </Dialog>
    </>
  );
};

export default observer(PlannerTimetable);
