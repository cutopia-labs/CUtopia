import React from 'react';
import { Typography } from '@material-ui/core';
import Card from '../atoms/Card';
import emptyPhoto from '../../images/undraw_empty_xct9.svg';
import errorPhoto from '../../images/undraw_server_down_s4lk.svg';
import notFoundPhoto from '../../images/404 Page Not Found _Monochromatic.svg';
import './ErrorCard.scss';

const TemplateCard = ({ photo, word }) => {
  return (
    <Card>
      <div className="null-card-container">
        <img src={photo} alt="Empty!" className="null-card-photo" />
        <Typography className="null-card-word" variant="subtitle1">
          {word}
        </Typography>
      </div>
    </Card>
  );
};

const ErrorCard = ({ mode }) => {
  switch (mode) {
    case 'null':
      return <TemplateCard photo={emptyPhoto} word="Nothing here" />;
    case 'error':
      return (
        <TemplateCard photo={errorPhoto} word="Something is wrong here..." />
      );
    case '404':
      return <TemplateCard photo={notFoundPhoto} word="Reource Not Found" />;
    default:
      return null;
  }
};

export default ErrorCard;
