import { PropsWithChildren } from 'react';

import './ListItem.scss';
import clsx from 'clsx';
import colors from '../../constants/colors';

type ListItemProps = {
  title?: string;
  caption?: string;
  onClick?: (...args: any[]) => any;
  chevron?: boolean;
  noBorder?: boolean;
  ribbonIndex?: number;
  left?: JSX.Element;
  right?: JSX.Element;
  className?: string;
  noHover?: boolean;
  onMouseDown?: (...args: any[]) => any;
};

const ListItem = ({
  title,
  caption,
  onClick,
  chevron,
  children,
  noBorder,
  ribbonIndex,
  left,
  right,
  className,
  onMouseDown,
  noHover,
}: PropsWithChildren<ListItemProps>) => (
  <div
    className={clsx(
      'list-item-container',
      !noBorder && 'border',
      className,
      !noHover && 'hover-bg'
    )}
    onClick={onClick}
    onMouseDown={onMouseDown}
  >
    {ribbonIndex !== undefined && (
      <span
        className="list-item-color-bar"
        style={{
          backgroundColor:
            colors.randomColors[
              ribbonIndex >= colors.randomColors.length
                ? ribbonIndex % colors.randomColors.length
                : ribbonIndex
            ],
        }}
      />
    )}
    {left}
    <span className="list-item-title-container column">
      {title && <span className="list-item-title title">{title}</span>}
      {caption && <span className="list-item-caption caption">{caption}</span>}
    </span>
    {children}
    {right}
    {chevron && <span className="list-item-title chevron">{'\u203A'}</span>}
  </div>
);

export default ListItem;
