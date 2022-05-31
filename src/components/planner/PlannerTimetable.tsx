import { useReducer, useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';

import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import styles from '../../styles/components/planner/PlannerTimetable.module.scss';
import { useView, usePlanner } from '../../store';
import { PLANNER_CONFIGS } from '../../constants/configs';
import { REMOVE_TIMETABLE, SHARE_TIMETABLE } from '../../constants/mutations';
import {
  Planner,
  SnackBarProps,
  TimetableOverviewMode,
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
import Footer from '../molecules/Footer';
import TimetablePanel from '../templates/TimetablePanel';

enum ShareTimetableMode {
  UPLOAD, // user persist timetable / persist sharing ttb
  SHARE,
}

type PlannerTimetableProps = {
  className?: string;
};

const getModeFromExpire = (expire: number) => {
  if (expire > 0) {
    return TimetableOverviewMode.SHARE;
  }
  return expire === 0
    ? TimetableOverviewMode.UPLOAD_SHARABLE
    : TimetableOverviewMode.UPLOAD;
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
  `${window.location.protocol}//${window.location.host}/planner?sid=${id}`;

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
        <div className={clsx(styles.shareLinkRow, 'shareBtnRow center-row')}>
          <TextField
            className={styles.plannerInputContainer}
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
      <div className="shareBtnRow center-row">
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

const PlannerTimetable: FC<PlannerTimetableProps> = ({ className }) => {
  const planner = usePlanner();
  const router = useRouter();
  const isHome = router.pathname == '/';
  const { sid: shareId } = router.query as {
    sid?: string;
  };
  const view = useView();
  const [shareCourses, setShareCourses] = useState<{
    mode: ShareTimetableMode;
  } | null>(null);
  const [shareConfig, dispatchShareConfig] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {}
  );

  const [getShareTimetable, { loading: getUploadTimetableLoading }] =
    useLazyQuery(GET_SHARE_TIMETABLE, {
      onCompleted: async (data: { timetable: UploadTimetable }) => {
        console.log(`loaded ${data?.timetable}`);
        const importedPlanner: Planner = {
          createdAt: data.timetable.createdAt,
          tableName: data.timetable.tableName,
          id: shareId,
          courses:
            data.timetable.entries.map(course => ({
              ...course,
              sections: Object.fromEntries(
                course.sections.map(section => [section.name, section])
              ),
            })) || [],
        };
        planner.updateCurrentPlanner(importedPlanner);
        router.push('/planner');
      },
      onError: view.handleError,
    });

  const [removeTimetable, { loading: removeTimetableLoading }] =
    useMutation(REMOVE_TIMETABLE);

  const onDelete = async (id: string, expire: number) => {
    try {
      await removeTimetable({
        variables: {
          id,
          expire,
        },
      });
      planner.updateStore(
        'remoteTimetableData',
        [...planner.remoteTimetableData].filter(item => item._id !== id)
      );
      view.setSnackBar('Deleted!');
      // i.e. if current planner is deleted
      if (id === planner.plannerId) {
        // Back to homepage
        router.push(`/planner`, undefined, { shallow: true });
      }
    } catch (e) {
      // To skip remove entry in state in case of any error
      view.handleError(e);
    }
  };
  const [uploadTimetable, { loading: uploadTimetableLoading }] = useMutation(
    SHARE_TIMETABLE,
    {
      onCompleted: handleCompleted(
        data => {
          const uploadTimetable = data?.uploadTimetable;
          if (!uploadTimetable?._id) {
            return view.setSnackBar({
              message: 'Cannot generate timetable QAQ...',
              severity: 'error',
            });
          }
          const newTimetableOverview = {
            _id: uploadTimetable._id,
            createdAt: uploadTimetable.createdAt,
            tableName: planner.plannerName,
            expire: getExpire(shareConfig?.expire),
            mode: getModeFromExpire(getExpire(shareConfig?.expire) as any),
          };
          // If uploaded a share timetable
          if (getExpire(shareConfig?.expire) !== -1) {
            const shareURL = generateTimetableURL(uploadTimetable?._id);
            dispatchShareConfig({
              shareLink: shareURL,
            });
            copy(shareURL);
          }
          planner.updateStore('remoteTimetableData', [
            ...(planner.remoteTimetableData || []),
            newTimetableOverview,
          ]);
          planner.setStore('plannerId', uploadTimetable?._id);
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
    if (!planner.plannerCourses?.length) {
      return view.setSnackBar({
        severity: 'warning',
        message: 'Empty timetable!',
      });
    }
    const data = {
      entries: planner.plannerCourses
        .filter(
          course =>
            course && course.sections && Object.values(course.sections)?.length
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
      tableName: planner.plannerName,
    };
    console.log(JSON.stringify(data));
    await uploadTimetable({
      variables: data,
    });
  };

  useEffect(() => {
    // if no planner, then init / load one
    if (!planner.plannerId) {
      createTimetable();
      return;
    }
    // otherwise switch to current planner
  }, [planner.plannerId]);

  useEffect(() => {
    dispatchShareConfig({
      expire: shareCourses?.mode === ShareTimetableMode.SHARE ? '7 days' : 'No',
      shareLink: '',
    });
  }, [planner.plannerId, shareCourses]);

  useEffect(() => {
    if (!shareId) return;
    if (!validShareId(shareId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
      return;
    }
    if (shareId === planner.plannerId) {
      view.setSnackBar({
        message: 'Shared planner already loaded!',
        severity: 'warning',
      });
      router.push('/planner');
      return;
    }
    getShareTimetable({
      variables: {
        id: shareId,
      },
    });
  }, [shareId, planner]);

  const shareTimetable = () => {};

  const switchTimetable = (id: string) => {
    router.push(`/planner?sid=${id}`, undefined, { shallow: true });
  };

  const updateTimetable = data => {
    uploadTimetable({
      variables: {
        _id: planner.plannerId,
        ...data,
      },
    });
  };

  const createTimetable = async () => {
    await uploadTimetable({
      variables: {
        entries: [],
        expire: -1,
      },
    });
  };

  return (
    <div className={clsx(styles.plannerTimetableContainer, 'column')}>
      {getUploadTimetableLoading && <Loading fixed />}
      {
        <TimetablePanel
          className={className}
          createTimetable={createTimetable}
          onShare={() =>
            setShareCourses({
              mode: ShareTimetableMode.SHARE,
            })
          }
          updateTimetable={updateTimetable}
          deleteTable={(id: string, expire: number) => onDelete(id, expire)}
        />
      }
      {!isHome && <Footer style={styles.plannerFooter} />}
      <Dialog
        transitionDuration={{
          enter: 120,
          exit: 0,
        }}
        className={styles.plannerShareDialog}
        onClose={() => setShareCourses(null)}
        TransitionProps={{
          onExited: () => setShareCourses(null),
        }}
        open={Boolean(shareCourses)}
      >
        <DialogContentTemplate
          className={styles.contentContainer}
          title={MODE_ASSETS[shareCourses?.mode]?.title}
          caption={`${
            planner.plannerName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME
          } (${planner.plannerCourses?.length} courses)`}
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
    </div>
  );
};

export default observer(PlannerTimetable);
