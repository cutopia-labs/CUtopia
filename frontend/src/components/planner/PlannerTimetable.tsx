import { FC, useEffect, useReducer, useState } from 'react';
import { useLazyQuery, useMutation } from '@apollo/client';
import { Button, Dialog } from '@mui/material';
import clsx from 'clsx';
import copy from 'copy-to-clipboard';
import { debounce } from 'lodash';
import { reaction } from 'mobx';
import { observer } from 'mobx-react-lite';
import { useRouter } from 'next/router';
import { useBeforeUnload } from 'react-use';

import { PLANNER_CONFIGS, TIMETABLE_SYNC_INTERVAL } from '../../config';
import { EXPIRE_LOOKUP } from '../../constants';
import { CLONE_TIMETABLE, UPLOAD_TIMETABLE } from '../../constants/mutations';
import { GET_TIMETABLE } from '../../constants/queries';
import { entriesToCourses } from '../../helpers/dtos';
import useMobileQuery from '../../hooks/useMobileQuery';
import { usePlanner, useUser, useView } from '../../store';
import styles from '../../styles/components/planner/PlannerTimetable.module.scss';
import {
  PlannerSyncState,
  ShareTimetableMode,
  TimetableOverviewMode,
  UploadTimetable,
} from '../../types';
import LoadingButton from '../atoms/LoadingButton';
import TextField from '../atoms/TextField';
import ChipsRow from '../molecules/ChipsRow';
import Footer from '../molecules/Footer';
import Section from '../molecules/Section';
import DialogContentTemplate from '../templates/DialogContentTemplate';
import LoadingView from '../atoms/LoadingView';
import TimetablePanel from '../templates/TimetablePanel';

const getModeFromExpireAt = (expireAt: number) =>
  expireAt > 0 ? TimetableOverviewMode.SHARE : TimetableOverviewMode.UPLOAD;

const getExpire = (value: string) => {
  if (!value) return null;
  if (value.endsWith('day') || value.endsWith('days')) {
    return parseInt(value[0], 10);
  }
  if (value === 'Yes') return EXPIRE_LOOKUP.shareableUpload;
  if (value === 'No') return EXPIRE_LOOKUP.upload;
  return value;
};

const getExpireAt = (expireDays: number, createdAt: number) => {
  if (expireDays <= 0) return -1;
  const expireAt = new Date(createdAt);
  expireAt.setDate(expireAt.getDate() + expireDays);
  return +expireAt;
};

const getLabelFromKey = {
  [EXPIRE_LOOKUP.shareableUpload]: 'Yes',
  [EXPIRE_LOOKUP.upload]: 'No',
};

const MODE_ASSETS = {
  [ShareTimetableMode.SHARE]: {
    sections: [
      {
        label: 'Expire In',
        chips: ['1 day', '3 days', '7 days'],
        key: 'expire',
      },
    ],
    label: 'share',
    title: 'Share Timetable',
  },
  [ShareTimetableMode.UPLOAD]: {
    sections: [
      {
        label: 'Shareable',
        chips: ['Yes', 'No'],
        key: 'expire',
      },
    ],
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
  onShareTimetable,
  uploadTimetableLoading,
  mode,
}) => (
  <>
    {MODE_ASSETS[mode]?.sections.map(section => (
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
            onChangeText={String}
            disabled
          />
          <Button
            className="copy"
            variant="contained"
            color="secondary"
            onClick={() => {
              copy(shareConfig.shareLink);
              view.setSnackBar('Copied share link to your clipboard!');
            }}
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
          onClick={onShareTimetable}
          variant="contained"
        >
          {MODE_ASSETS[mode]?.label}
        </LoadingButton>
      </div>
    )}
  </>
);

const SHARE_ID_RULE = /^[A-Za-z0-9_-]{8,10}$/i;

type PlannerTimetableProps = {
  className?: string;
  hide?: boolean;
};

const PlannerTimetable: FC<PlannerTimetableProps> = ({ className, hide }) => {
  const planner = usePlanner();
  const user = useUser();
  const view = useView();
  const router = useRouter();
  const isMobile = useMobileQuery();
  const isHome = router.pathname === '/';
  const { sid: shareId } = router.query as { sid?: string };
  const [shareCourses, setShareCourses] = useState<{
    mode: ShareTimetableMode;
  } | null>(null);
  const [shareConfig, dispatchShareConfig] = useReducer(
    (state, action) => ({ ...state, ...action }),
    {}
  );

  const [uploadTimetable, { loading: uploadTimetableLoading }] =
    useMutation(UPLOAD_TIMETABLE);
  const [cloneTimetable, { loading: cloneTimetableLoading }] =
    useMutation(CLONE_TIMETABLE);
  const [getSharedTimetable, { loading: sharedTimetableLoading }] =
    useLazyQuery(GET_TIMETABLE, {
      fetchPolicy: 'network-only',
      onCompleted: async (data: { timetable: UploadTimetable }) => {
        const timetable = data?.timetable;
        if (!timetable) return;
        const imported = await planner.importLocalTimetable({
          id: shareId,
          createdAt: timetable.createdAt,
          tableName: timetable.tableName,
          expireAt: timetable.expireAt,
          courses: entriesToCourses(timetable.entries),
        });
        if (!imported) return;
        await router.replace('/planner');
        view.setSnackBar('Shared timetable saved to this device');
      },
      onError: view.handleError,
    });

  useEffect(() => {
    if (!shareId) planner.initializePlanner();
  }, [planner.offline, shareId]);

  useEffect(() => {
    const save = debounce(
      () => planner.saveCurrentPlanner(),
      planner.offline ? 300 : TIMETABLE_SYNC_INTERVAL
    );
    const disposer = reaction(
      () => ({ delta: planner.delta, syncing: planner.isSyncing }),
      ({ delta, syncing }) => delta && !syncing && save()
    );
    return () => {
      save.flush();
      disposer();
    };
  }, [planner.offline]);

  useEffect(() => {
    dispatchShareConfig({
      expire: shareCourses?.mode === ShareTimetableMode.SHARE ? '7 days' : 'No',
      shareLink: '',
    });
  }, [shareCourses]);

  useEffect(() => {
    if (!shareId) return;
    if (!SHARE_ID_RULE.test(shareId)) {
      view.warn('Invalid shared timetable!');
      router.replace('/planner');
      return;
    }

    if (planner.offline) {
      getSharedTimetable({ variables: { id: shareId } });
      return;
    }

    const loadCloudShare = async () => {
      try {
        const cloneId = planner.inShareMap(shareId);
        if (cloneId) {
          await planner.switchTimetable(cloneId);
        } else {
          const { data } = await cloneTimetable({ variables: { id: shareId } });
          const timetable = data?.cloneTimetable;
          const clonedId = timetable?._id;
          planner.updateCurrentPlanner({
            id: clonedId,
            createdAt: timetable.createdAt,
            tableName: timetable.tableName,
            expireAt: timetable.expireAt,
            courses: entriesToCourses(timetable.entries),
          });
          planner.addToShareMap(shareId, clonedId);
        }
        await router.replace('/planner');
        view.setSnackBar('Timetable loaded');
      } catch (error) {
        view.handleError(error);
      }
    };
    loadCloudShare();
  }, [shareId, planner.offline]);

  useBeforeUnload(
    !planner.offline && planner.syncState === PlannerSyncState.DIRTY,
    'Timetable syncing, please wait for a few seconds before leaving'
  );

  const createTimetable = async () => {
    await planner.saveCurrentPlanner();
    const created = await planner.createTimetable();
    if (created) view.setSnackBar('Timetable created!');
  };

  const onShareTimetable = async event => {
    try {
      event.preventDefault();
      const expire = getExpire(shareConfig.expire) as number;
      await planner.saveCurrentPlanner();
      await uploadTimetable({
        variables: { _id: planner.plannerId, expire },
      });
      const expireAt = getExpireAt(expire, +new Date());
      planner.updateTimetableOverview({
        _id: planner.plannerId,
        expireAt,
        mode: getModeFromExpireAt(expireAt),
      });
      planner.syncPlanner({ expireAt });
      const shareLink = generateTimetableURL(planner.plannerId);
      dispatchShareConfig({ shareLink });
      copy(shareLink);
      view.setSnackBar('Copied share link to your clipboard!');
    } catch (error) {
      view.handleError(error);
    }
  };

  const onShareClick = () => {
    if (!user.loggedIn) {
      view.setSnackBar('Sign in to sync and share your timetable');
      router.push('/login?returnUrl=/planner');
      return;
    }
    if (
      getModeFromExpireAt(planner.planner?.expireAt) ===
      TimetableOverviewMode.SHARE
    ) {
      copy(generateTimetableURL(planner.plannerId));
      view.setSnackBar('Copied share link to your clipboard!');
      return;
    }
    setShareCourses({ mode: ShareTimetableMode.SHARE });
  };

  if (hide) return null;

  return (
    <div className={clsx(styles.plannerTimetableContainer, 'column')}>
      <LoadingView
        loading={
          planner.loading || sharedTimetableLoading || cloneTimetableLoading
        }
        fixed
      />
      {!user.loggedIn && (
        <div className={clsx(styles.guestNotice, 'center-row')}>
          <span>
            <strong>Guest planner</strong> — saved on this device
          </span>
          <Button
            size="small"
            onClick={() => router.push('/login?returnUrl=/planner')}
          >
            Sign in to sync
          </Button>
        </div>
      )}
      <TimetablePanel
        className={className}
        createTimetable={createTimetable}
        onShare={onShareClick}
        switchTimetable={planner.switchTimetable}
        deleteTable={planner.deleteTimetable}
      />
      <Footer style={styles.plannerFooter} visible={!isHome && !isMobile} />
      <Dialog
        transitionDuration={{ enter: 120, exit: 0 }}
        className={styles.plannerShareDialog}
        onClose={() => setShareCourses(null)}
        TransitionProps={{ onExited: () => setShareCourses(null) }}
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
            onShareTimetable={onShareTimetable}
            uploadTimetableLoading={uploadTimetableLoading}
            mode={shareCourses?.mode}
          />
        </DialogContentTemplate>
      </Dialog>
    </div>
  );
};

export default observer(PlannerTimetable);
