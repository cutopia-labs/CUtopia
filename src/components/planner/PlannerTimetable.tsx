import { useReducer, useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';

import { reaction } from 'mobx';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { cloneDeep, isEqual } from 'lodash';
import styles from '../../styles/components/planner/PlannerTimetable.module.scss';
import { useView, usePlanner } from '../../store';
import {
  PLANNER_CONFIGS,
  TIMETABLE_SYNC_INTERVAL,
} from '../../constants/configs';
import { REMOVE_TIMETABLE, SHARE_TIMETABLE } from '../../constants/mutations';
import {
  Planner,
  PlannerCourse,
  ShareTimetableMode,
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
import { EXPIRE_LOOKUP } from '../../constants';

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
  /* Handle invalid case */
  if (!str) {
    return null;
  }
  /* If user choose share expire days */
  if (str.endsWith('day') || str.endsWith('days')) {
    return parseInt(str[0], 10);
  }
  /* If no expire days, then its upload but not share */
  switch (str) {
    /* If the upload is shareable */
    case 'Yes':
      return EXPIRE_LOOKUP.shareableUpload;
    /* If it's private upload */
    case 'No':
      return EXPIRE_LOOKUP.upload;
  }
  return str;
};

const getLabelFromKey = {
  [EXPIRE_LOOKUP.shareableUpload]: 'Yes',
  [EXPIRE_LOOKUP.upload]: 'No',
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

export const processEntriesForGql = (
  courses: PlannerCourse[],
  skipHide: boolean = true
) => {
  return courses
    .filter(
      course =>
        course && course.sections && Object.values(course.sections)?.length
    )
    .map(course => {
      let sections = Object.values(course?.sections || {});
      sections = skipHide
        ? sections.filter(section => section && !section.hide)
        : sections;
      return {
        ...course,
        sections: sections.map(section => {
          const { hide, ...shareSection } = section;
          return shareSection;
        }),
      };
    });
};

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

type PlannerDelta = {
  tableName?: string;
  courses?: PlannerCourse[];
};

const getDelta = (
  planner: Planner,
  courses: PlannerCourse[],
  tableName: string
): PlannerDelta | null => {
  console.log(JSON.stringify(planner?.courses));
  console.log(JSON.stringify(courses) + ', ' + tableName);
  const delta: PlannerDelta = {};
  if (tableName !== planner?.tableName) {
    delta['tableName'] = tableName;
  }
  if (!isEqual(courses, planner?.courses)) {
    delta.courses = courses;
  }
  return Object.keys(delta).length ? delta : null;
};

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
          if (getExpire(shareConfig?.expire) !== EXPIRE_LOOKUP.upload) {
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
            getExpire(shareConfig?.expire) === EXPIRE_LOOKUP.upload
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
      entries: processEntriesForGql(planner.plannerCourses),
      expire: getExpire(shareConfig.expire),
      tableName: planner.plannerName,
    };
    console.log(JSON.stringify(data));
    await uploadTimetable({
      variables: data,
    });
  };

  // on mount
  useEffect(() => {
    // start sync
    const disposer = reaction(
      () => ({
        delta: getDelta(
          planner.planner,
          planner.plannerCourses,
          planner.plannerName
        ),
        _id: planner.plannerId,
      }),
      ({ delta, _id }) => {
        console.log(`Syncing planner:\n${JSON.stringify(delta, null, 2)}`);
        /* If no update, do nothing */
        if (!delta) return;
        /* Update the prev planner course */
        planner.planner = {
          ...planner.planner,
          ...cloneDeep(delta),
        };
        /* Process the entries for gql */
        if (delta.courses) {
          delta['entries'] = processEntriesForGql(delta.courses);
          delete delta.courses;
        }
        /* If dirty, then upload timetable */
        uploadTimetable({
          variables: {
            _id,
            ...delta,
            expire: EXPIRE_LOOKUP.upload,
          },
        });
        console.log({
          _id,
          ...delta,
        });
      },
      {
        delay: TIMETABLE_SYNC_INTERVAL,
      }
    );
    // end sync b4 unmount (handle unload here!)
    return () => disposer();
  }, []);

  useEffect(() => {
    // if no planner, then init / load one
    if (!planner.plannerId) {
      // createTimetable();
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

  const updateTimetable = data => {
    uploadTimetable({
      variables: {
        _id: planner.plannerId,
        ...data,
      },
    });
  };

  const createTimetable = async () => {
    console.log('Called create timetable');
    const res = await uploadTimetable({
      variables: {
        entries: [],
        expire: EXPIRE_LOOKUP.upload,
      },
    });
    const newTimetable = res.data?.uploadTimetable;
    planner.newPlanner(newTimetable?._id, newTimetable?.createdAt);
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
