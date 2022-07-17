import { useReducer, useState, useEffect, FC, useRef } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { cloneDeep } from 'lodash';

import styles from '../../styles/components/planner/PlannerTimetable.module.scss';
import { useView, usePlanner } from '../../store';
import {
  PLANNER_CONFIGS,
  TIMETABLE_SYNC_INTERVAL,
} from '../../constants/configs';
import {
  REMOVE_TIMETABLE,
  SWITCH_TIMETABLE,
  UPLOAD_TIMETABLE,
} from '../../constants/mutations';
import {
  Planner,
  PlannerCourse,
  ShareTimetableMode,
  TimetableOverviewMode,
  UploadTimetable,
} from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import TextField from '../atoms/TextField';
import handleCompleted from '../../helpers/handleCompleted';
import LoadingButton from '../atoms/LoadingButton';
import Loading from '../atoms/Loading';
import DialogContentTemplate from '../templates/DialogContentTemplate';
import Section from '../molecules/Section';
import Footer from '../molecules/Footer';
import TimetablePanel from '../templates/TimetablePanel';
import { CREATE_PLANNER_FLAG, EXPIRE_LOOKUP } from '../../constants';
import { GET_TIMETABLE } from '../../constants/queries';

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

export const coursesToEntries = (
  courses: PlannerCourse[],
  skipHide: boolean = false
) =>
  courses
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
          /* Remove the hide attr if not hidden */
          if (!section.hide) {
            delete section.hide;
          }
          return section;
        }),
      };
    });

export const entriesToCourses = (entries: any[]) =>
  entries.map(course => ({
    ...course,
    sections: Object.fromEntries(
      course.sections.map(section => [section.name, section])
    ),
  })) || [];

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
            color="secondary"
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

const SHARE_ID_RULE = new RegExp('^[A-Za-z0-9_-]{8,10}$', 'i');

const validShareId = (id: string) => id && SHARE_ID_RULE.test(id);

const PlannerTimetable: FC<PlannerTimetableProps> = ({ className }) => {
  const planner = usePlanner();
  const router = useRouter();
  const firstUpdate = useRef(true);
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

  const [getTimetable, { loading: getTimetableLoading }] = useLazyQuery(
    GET_TIMETABLE,
    {
      onCompleted: async (data: { timetable: UploadTimetable }) => {
        applyTimetable(data?.timetable, planner.plannerId);
      },
      onError: e => {
        view.handleError(e);
        /* Reset the planner id and create a new timetable */
        createTimetable();
      },
    }
  );

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
      /* if current planner is deleted */
      if (id === planner.plannerId) {
        router.push(`/planner`, undefined, { shallow: true });
      }
    } catch (e) {
      // To skip remove entry in state in case of any error
      view.handleError(e);
    }
  };

  const [uploadTimetable, { loading: uploadTimetableLoading }] = useMutation(
    UPLOAD_TIMETABLE,
    {
      onCompleted: handleCompleted(
        data => {
          const uploadTimetable = data?.uploadTimetable;
          /* If no ttb id, then it's ttb sync result, no need switch plannerId */
          if (!uploadTimetable?._id) {
            console.log('Updated');
            return;
          }
          const isShare =
            getExpire(shareConfig?.expire) !== EXPIRE_LOOKUP.upload;
          const message = getUploadTimetableMessage(uploadTimetable, isShare);
          if (message) {
            view.setSnackBar(message);
          }
          const newTimetableOverview = {
            _id: uploadTimetable._id,
            createdAt: uploadTimetable.createdAt,
            tableName: planner.plannerName,
            expire: getExpire(shareConfig?.expire),
            mode: getModeFromExpire(getExpire(shareConfig?.expire) as any),
          };
          planner.updateStore('remoteTimetableData', [
            ...(planner.remoteTimetableData || []),
            newTimetableOverview,
          ]);
          // If uploaded a share timetable
          if (isShare) {
            const shareURL = generateTimetableURL(uploadTimetable._id);
            dispatchShareConfig({
              shareLink: shareURL,
            });
            copy(shareURL);
            return;
          }
          /* If it's create new, then only need update local plannerId, cuz remote is updated */
          console.log(`Updating plannerId to ${uploadTimetable?._id}`);
          planner.updateStore('plannerId', uploadTimetable?._id);
        },
        {
          mute: true, // handle snackbar message in callback
        }
      ),
      onError: view.handleError,
    }
  );

  const [switchTimetableMutation, { loading: switchTimetableLoading }] =
    useMutation(SWITCH_TIMETABLE);

  const applyTimetable = (
    timetable: UploadTimetable | null,
    id: string,
    msg?: string
  ) => {
    timetable = timetable || ({} as any);
    const importedPlanner: Planner = {
      createdAt: timetable.createdAt,
      tableName: timetable.tableName,
      id,
      courses: entriesToCourses(timetable.entries),
    };
    planner.updateCurrentPlanner(importedPlanner);
    /* If current path is a share path, then change to planner */
    msg = shareId ? 'Timetable loaded' : msg;
    if (shareId) {
      router.push('/planner');
    }
    if (msg) view.setSnackBar(msg);
  };

  const switchTimetable = async (id: string) => {
    try {
      const { data } = await switchTimetableMutation({ variables: { id } });
      applyTimetable(
        data?.switchTimetable,
        id,
        `Switched to ${
          data?.switchTimetable?.tableName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME
        }`
      );
    } catch (e) {
      console.warn(e);
      view.handleError(e);
      createTimetable();
    }
  };

  const updateTimetable = async ({ delta, _id }) => {
    console.log('Update timetable triggered');
    console.log(
      `ID: (${_id})\nSyncing planner:\n${JSON.stringify(delta, null, 2)}`
    );
    /* If no update / updating, do nothing */
    if (!delta || planner.isSyncing) return;
    /* Update sync states to syncing */
    const deltaClone = cloneDeep(delta);
    planner.updateStore('isSyncing', true);
    /* Process the entries for gql */
    if (delta.courses) {
      delta['entries'] = coursesToEntries(delta.courses);
      delete delta.courses;
    }
    /* If dirty, then upload timetable */
    await uploadTimetable({
      variables: {
        _id,
        ...delta,
        expire: EXPIRE_LOOKUP.default,
      },
    });
    planner.updateStore('isSyncing', false);
    /* Update planner (prev state) after synced */
    planner.planner = {
      ...planner.planner,
      ...deltaClone,
    };
    console.log({
      _id,
      ...delta,
    });
  };

  const getUploadTimetableMessage = (
    uploadTimetable,
    isShare: boolean
  ): string => {
    const prevPlannerId = planner.plannerId;
    /* If no prev planner id, then it's a newly created TTB */
    if (prevPlannerId === '') {
      return 'TimeTable Created';
    }
    /* If current planner id same as prev one, then it's update / share */
    if (prevPlannerId === uploadTimetable._id) {
      return null;
    }
    return isShare ? 'Copied share link to your clipboard!' : null;
  };

  const onShareTimetTable = async e => {
    e.preventDefault();
    if (!planner.plannerCourses?.length) {
      return view.setSnackBar({
        severity: 'warning',
        message: 'Empty timetable!',
      });
    }
    const data = {
      entries: coursesToEntries(planner.plannerCourses),
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
        delta: planner.delta,
        _id: planner.plannerId,
      }),
      updateTimetable,
      {
        delay: TIMETABLE_SYNC_INTERVAL,
      }
    );
    // end sync b4 unmount (handle unload here!)
    return () => disposer();
  }, []);

  /*
   * Init based on planner id
   */
  useEffect(() => {
    console.log(`Planner ID: ${planner.plannerId}`);
    /* if no planner, then init / load one */
    if (planner.plannerId === CREATE_PLANNER_FLAG) {
      createTimetable();
      return;
    }
    /* if prev planner id !== curr planner id, then get planner (e.g. load default ttb) */
    if (planner.planner?.id !== planner.plannerId) {
      getTimetable({
        variables: {
          id: planner.plannerId,
        },
      });
    }
  }, [planner.plannerId]);

  useEffect(() => {
    dispatchShareConfig({
      expire: shareCourses?.mode === ShareTimetableMode.SHARE ? '7 days' : 'No',
      shareLink: '',
    });
  }, [shareCourses]);

  useEffect(() => {
    if (!shareId) return;
    if (!validShareId(shareId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
      return;
    }
    switchTimetable(shareId);
  }, [shareId]);

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
      {(getTimetableLoading ||
        switchTimetableLoading ||
        removeTimetableLoading) && <Loading fixed />}
      {
        <TimetablePanel
          className={className}
          createTimetable={createTimetable}
          onShare={() =>
            setShareCourses({
              mode: ShareTimetableMode.SHARE,
            })
          }
          switchTimetable={switchTimetable}
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
