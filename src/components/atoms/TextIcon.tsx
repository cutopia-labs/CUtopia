import { Avatar } from '@material-ui/core';
import clsx from 'clsx';

import './TextIcon.scss';
import colors from '../../constants/colors';
import { hashing } from '../../helpers';

type TextIconProps = {
  text: string;
  className?: string;
  backgroundColor?: string;
  size?: number;
};

const TextIcon = ({
  text,
  className,
  backgroundColor,
  size,
}: TextIconProps) => (
  <Avatar
    style={{
      backgroundColor:
        backgroundColor ||
        colors.randomColors[hashing(text, colors.randomColorsLength)],
      ...(size && {
        width: size,
        height: size,
        fontSize: size / 2,
      }),
    }}
    className={clsx('text-icon', className)}
  >
    {text.charAt(0)}
  </Avatar>
);

export default TextIcon;
