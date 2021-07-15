import { PropsWithChildren } from 'react';

import './ListItem.css';
import colors from '../constants/colors';

type ListItemProps = {
  label?: string;
  caption?: string;
  onClick?: (...args: any[]) => any;
  chevron?: boolean;
  noBorder?: boolean;
  ribbonIndex?: number;
  left?: JSX.Element;
  right?: JSX.Element;
  className?: string;
  onMouseDown?: (...args: any[]) => any;
};

const ListItem = ({
  label,
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
}: PropsWithChildren<ListItemProps>) => (
  <div
    className={`list-item-container${!noBorder ? ' border' : ''} row${
      className ? ` ${className}` : ''
    }`}
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
    {label && <span className="list-item-label title">{label}</span>}
    {caption && <span className="list-item-caption caption">{caption}</span>}
    {left}
    {children}
    {right}
    {chevron && <span className="list-item-label chevron">{'\u203A'}</span>}
  </div>
);

export default ListItem;
