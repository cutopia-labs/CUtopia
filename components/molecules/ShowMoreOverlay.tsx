import { ExpandMore } from '@material-ui/icons';

import './ShowMoreOverlay.scss';

type ShowMoreOverlayProps = {
  visible: boolean;
  onShowMore: (...args: any[]) => any;
};

export default function ShowMoreOverlay({
  visible,
  onShowMore,
}: ShowMoreOverlayProps) {
  if (visible) {
    return (
      <div className="show-more-overlay" onClick={onShowMore}>
        <div className="show-more-label center-row">
          Show More
          <ExpandMore />
        </div>
      </div>
    );
  }

  return null;
}
