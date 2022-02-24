import '../../styles/components/atoms/AccordionCard.module.module.scss';
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';
import { FC } from 'react';

const AccordionCard: FC<AccordionProps> = ({
  expanded,
  onChange,
  className,
  children,
  title,
}) => (
  <Accordion
    expanded={expanded}
    onChange={onChange}
    className={clsx('accordion-card', className)}
    elevation={0}
  >
    <AccordionSummary expandIcon={<ExpandMore />}>
      <h4>{title}</h4>
    </AccordionSummary>
    <AccordionDetails>{children}</AccordionDetails>
  </Accordion>
);

export default AccordionCard;
