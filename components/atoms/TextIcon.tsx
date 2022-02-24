import { Avatar } from '@material-ui/core';
import clsx from 'clsx';

import '../../styles/components/atoms/TextIcon.module.scss';
import colors from '../../constants/colors';
import { hashing } from '../../helpers';

type TextIconProps = {
  text?: string;
  char?: string;
  fontSize?: number;
  className?: string;
  backgroundColor?: string;
  size?: number;
};

const TextIcon = ({
  text,
  char,
  className,
  backgroundColor,
  size,
  fontSize,
}: TextIconProps) => (
  <Avatar
    style={{
      backgroundColor:
        backgroundColor ||
        colors.randomColors[hashing(text, colors.randomColorsLength)],
      ...(size && {
        width: size,
        height: size,
        fontSize: fontSize || size / 2,
      }),
    }}
    className={clsx('text-icon', className)}
  >
    {char || text.charAt(0)}
  </Avatar>
);

export default TextIcon;
