import { useMemo } from 'react';

import './Points.scss';

type PointsProps = {
  text: string;
};

const Points = ({ text }: PointsProps) => {
  const texts = useMemo(() => {
    // TODO: delimiter for PHED1031, CURE1009, UGEB2303
    const delimiters = [
      /(?<!\d)\d{1,2}\. ?/, // CSCI1040, AIST1000
      /\d{1,2}、 ?/,
      / \(\d{1,2}\) ?/, // UGEB1492, CURE1123
      /(?<!\d)\d{1,2}\) ?/,
      /● ?/,
      /• ?/, // MEDM5301
      /(?<!\w)- ?/, // FAAS1110, FAAS3219,
    ];
    const delimiter = delimiters.find((d) => d.test(text));
    return text.split(delimiter);
  }, [text]);

  return (
    <>
      {texts.map((text, i) => (
        <p className="caption" key={i}>
          {i === 0 ? '' : '-'} {text}
        </p>
      ))}
    </>
  );
};

export default Points;
