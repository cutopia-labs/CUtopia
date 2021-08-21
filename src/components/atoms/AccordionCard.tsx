import './AccordionCard.scss';
import {
  Accordion,
  AccordionDetails,
  AccordionProps,
  AccordionSummary,
} from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import clsx from 'clsx';

const AccordionCard = ({
  expanded,
  onChange,
  className,
  children,
  title,
  ...props
}: AccordionProps) => (
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
