import { useReducer, useState, useEffect, FC } from 'react';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Dialog } from '@material-ui/core';
import copy from 'copy-to-clipboard';
import { useRouter } from 'next/router';
import clsx from 'clsx';
import { debounce } from 'lodash';

import { useBeforeUnload } from 'react-use';
import styles from '../../styles/components/planner/PlannerTimetable.module.scss';
import { useView, usePlanner } from '../../store';
import {
  PLANNER_CONFIGS,
  TIMETABLE_SYNC_INTERVAL,
} from '../../constants/configs';
import {
  CLONE_TIMETABLE,
  REMOVE_TIMETABLE,
  SWITCH_TIMETABLE,
  UPLOAD_TIMETABLE,
} from '../../constants/mutations';
import {
  Planner,
  PlannerCourse,
  PlannerSyncState,
  ShareTimetableMode,
  TimetableOverviewMode,
  UploadTimetable,
} from '../../types';
import ChipsRow from '../molecules/ChipsRow';
import TextField from '../atoms/TextField';
import LoadingButton from '../atoms/LoadingButton';
import Loading from '../atoms/Loading';
import DialogContentTemplate from '../templates/DialogContentTemplate';
import Section from '../molecules/Section';
import Footer from '../molecules/Footer';
import TimetablePanel from '../templates/TimetablePanel';
import {
  CREATE_PLANNER_FLAG,
  EXPIRE_LOOKUP,
  makeWarning,
} from '../../constants';
import { GET_TIMETABLE } from '../../constants/queries';
import useMobileQuery from '../../hooks/useMobileQuery';

type PlannerTimetableProps = {
  className?: string;
};

const getModeFromExpireAt = (expireAt: number) => {
  if (expireAt > 0) {
    return TimetableOverviewMode.SHARE;
  }
  return TimetableOverviewMode.UPLOAD;
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

const getExpireAt = (
  str: string | number,
  createdAt: number,
  isExpire: boolean = false
): number => {
  const expireDays = isExpire ? str : getExpire(str as string);
  if (expireDays > 0) {
    const createDate = new Date(createdAt);
    createDate.setDate(createDate.getDate() + (expireDays as number));
    return +createDate;
  } else return -1;
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
          const { hide, ...copy } = section;
          if (hide) {
            (copy as any).hide = true;
          }
          return copy;
        }),
      };
    });

export const entriesToCourses = (entries: any[]) =>
  entries.map(course => ({
    ...course,
    sections: Object.fromEntries(
      course.sections.map(section => {
        const sectionCopy = {
          ...section,
          hide: section.hide || false, // Must set to false, otherwise will sync twice!!!
        };
        return [section.name, sectionCopy];
      })
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
  const isMobile = useMobileQuery();
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

  const [uploadTimetable, { loading: uploadTimetableLoading }] = useMutation(
    UPLOAD_TIMETABLE,
    {
      onError: view.handleError,
    }
  );

  const [switchTimetableMutation, { loading: switchTimetableLoading }] =
    useMutation(SWITCH_TIMETABLE);

  const [cloneTimetableMutation, { loading: cloneTimetableLoading }] =
    useMutation(CLONE_TIMETABLE);

  const applyTimetable = (
    timetable: UploadTimetable | null,
    id: string,
    msg?: string,
    addToOverview?: boolean
  ) => {
    timetable = timetable || ({} as any);
    const importedPlanner: Planner = {
      createdAt: timetable.createdAt,
      tableName: timetable.tableName,
      expireAt: timetable.expireAt,
      id,
      courses: entriesToCourses(timetable.entries),
    };
    console.log(importedPlanner);
    if (addToOverview) {
      const overview = {
        _id: id,
        ...importedPlanner,
        mode: getModeFromExpireAt(timetable.expireAt),
      };
      delete overview.courses;
      planner.updateTimetableOverview(overview as any);
    }
    planner.updateCurrentPlanner(importedPlanner);
    /* If current path is a share path, then change to planner */
    msg = shareId ? 'Timetable loaded' : msg;
    if (shareId) {
      router.push('/planner');
    }
    if (msg) view.setSnackBar(msg);
  };

  const onDelete = async (id: string, expire: number) => {
    try {
      const isCurrentPlanner = id === planner.plannerId;
      /* Get next timetable id if deleting current planner */
      const variables: any = {
        id,
        expire,
      };
      /* Undefined switch to means not deleting current ttb, no need switch */
      let switchTo = undefined;
      if (isCurrentPlanner) {
        let maxCreatedAt = 0;
        /* If it's the last ttb, then switch to null means create one */
        switchTo = null;
        planner.timetableOverviews.forEach(d => {
          if (d.createdAt > maxCreatedAt && d._id !== id) {
            maxCreatedAt = d.createdAt;
            switchTo = d._id;
          }
        });
        variables.switchTo = switchTo;
      }
      const { data } = await removeTimetable({
        variables,
      });
      view.setSnackBar('Deleted!');
      /* Update the timetableOverviews */
      planner.removeTimetableOverview(id);
      /* Switch to the new if deleting current planner */
      if (isCurrentPlanner) {
        console.log(
          `Switch to ${
            switchTo || data?.removeTimetable?._id
          }\n${JSON.stringify(data?.removeTimetable, null, 2)}`
        );
        if (data?.removeTimetable) {
          applyTimetable(
            data?.removeTimetable,
            switchTo || data?.removeTimetable?._id,
            undefined,
            !switchTo
          );
        } else {
          createTimetable();
        }
      }
    } catch (e) {
      // To skip remove entry in state in case of any error
      view.handleError(e);
    }
  };

  const switchTimetable = async (id: string) => {
    if (id === planner.plannerId) return;
    try {
      if (planner.syncState === PlannerSyncState.DIRTY) {
        console.log('Is dirty');
        /* May call twice? Ref: https://github.com/lodash/lodash/issues/4185 */
        await updateTimetable({
          delta: planner.delta,
          _id: planner.plannerId,
          syncing: planner.isSyncing,
        });
        updateTimetable.flush();
      }
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

  const updateTimetable = debounce(
    async ({ delta, _id, syncing }) => {
      console.log(`Handle here in Fn`);
      console.log(`Update timetable fired ${JSON.stringify(delta)}`);
      /* If no update / updating, do nothing */
      if (!delta || syncing) return;
      /* Update sync states to syncing */
      planner.updateStore('isSyncing', true);
      const deltaClone = JSON.parse(JSON.stringify(delta));
      console.log(deltaClone);
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
      /* Update planner (prev state) after synced */
      planner.syncPlanner(deltaClone);
      /*
      console.log('Planner courses:');
      console.log(toJS(planner.plannerCourses));
      console.log('Planner:');
      console.log(toJS(planner.planner.courses));
      console.log(
        `Isequal: ${isEqual(planner.plannerCourses, planner.planner.courses)}`
      );
      */
      planner.updateStore('isSyncing', false);
    },
    TIMETABLE_SYNC_INTERVAL,
    {
      trailing: true,
    }
  );

  const onShareTimetTable = async e => {
    try {
      e.preventDefault();
      const expire = getExpire(shareConfig.expire);
      await uploadTimetable({
        variables: {
          _id: planner.plannerId,
          expire,
        },
      });
      const expireAt = getExpireAt(expire, +new Date(), true);
      const overview = {
        _id: planner.plannerId,
        expireAt,
        mode: getModeFromExpireAt(expireAt),
      };
      planner.updateTimetableOverview(overview);
      planner.syncPlanner({ expireAt });
      const shareURL = generateTimetableURL(planner.plannerId);
      dispatchShareConfig({
        shareLink: shareURL,
      });
      copy(shareURL);
      view.setSnackBar('Copied share link to your clipboard!');
    } catch {
      makeWarning('Share timetable failed...', view);
    }
  };

  // on mount
  useEffect(() => {
    // start sync
    const disposer = reaction(
      () => ({
        delta: planner.delta,
        _id: planner.plannerId,
        syncing: planner.isSyncing,
      }),
      data => {
        console.log(
          `(${+new Date()}) Reaction fired ${JSON.stringify(data.delta)}`
        );
        updateTimetable(data);
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
    /* If the id is invalid, return */
    if (!shareId) return;
    if (!validShareId(shareId)) {
      view.setSnackBar({
        message: 'Invalid shared timetable!',
        severity: 'warning',
      });
      router.push('/planner');
      return;
    }
    /*
     * If the id is valid, check if it's cloned,
     * switch ttb if cloned otherwise clone
     */
    const cloneId = planner.inShareMap(shareId);
    console.log(`Clone id ${cloneId}`);
    if (cloneId) {
      switchTimetable(cloneId);
    } else {
      cloneTimetable(shareId);
    }
  }, [shareId]);

  // If planner is dirty, prevent unload
  useBeforeUnload(() => {
    console.log(
      `Leave detected, dirty: ${planner.syncState === PlannerSyncState.DIRTY}`
    );
    if (planner.syncState === PlannerSyncState.DIRTY) {
      updateTimetable({
        delta: planner.delta,
        _id: planner.plannerId,
      });
      return true;
    }
    return false;
  }, 'Timetable syncing, please wait for a few seconds before leaving');

  const createTimetable = async () => {
    try {
      console.log('Called create timetable');
      const { data } = await uploadTimetable({
        variables: {
          entries: [],
          expire: EXPIRE_LOOKUP.upload,
        },
      });
      view.setSnackBar('Timetable created!');
      const timetable = data?.uploadTimetable;
      const overview = {
        _id: timetable._id,
        createdAt: timetable.createdAt,
        tableName: planner.plannerName,
        expireAt: -1,
        mode: TimetableOverviewMode.UPLOAD,
      };
      planner.updateTimetableOverview(overview, true);
      /* If it's create new, then only need update local plannerId, cuz remote is updated */
      planner.updateStore('plannerId', timetable._id);
      const newTimetable = data?.uploadTimetable;
      planner.newPlanner(newTimetable?._id, newTimetable?.createdAt);
    } catch {
      /* Update planner id to prevent create ttb called inf times */
      planner.updateStore('plannerId', 'FAIL');
      view.setSnackBar({
        message: 'Create timetable failed...',
        severity: 'warning',
      });
    }
  };

  const cloneTimetable = async (shareId: string) => {
    try {
      const { data } = await cloneTimetableMutation({
        variables: { id: shareId },
      });
      const clonedTtbId = data?.cloneTimetable._id;
      console.log(`Cloned ttb ${clonedTtbId}`);
      applyTimetable(
        data?.cloneTimetable,
        clonedTtbId,
        `Loaded share timetable ${
          data?.cloneTimetable?.tableName || PLANNER_CONFIGS.DEFAULT_TABLE_NAME
        }`
      );
      planner.addToShareMap(shareId, clonedTtbId);
    } catch (e) {
      console.warn(e);
      view.handleError(e);
    }
  };

  const onShareClick = () => {
    /* If it's shared, then copy link and display message */
    console.log(`${planner.planner.expireAt}`);
    if (
      getModeFromExpireAt(planner.planner?.expireAt) ===
      TimetableOverviewMode.SHARE
    ) {
      copy(generateTimetableURL(planner.plannerId));
      view.setSnackBar('Copied share link to your clipboard!');
    } else {
      setShareCourses({
        mode: ShareTimetableMode.SHARE,
      });
    }
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
          onShare={onShareClick}
          switchTimetable={switchTimetable}
          deleteTable={(id: string, expire: number) => onDelete(id, expire)}
        />
      }
      {!isHome && !isMobile && <Footer style={styles.plannerFooter} />}
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
