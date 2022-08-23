import { FC } from 'react';
import { NextSeo } from 'next-seo';
import {
  DEFAULT_HEAD,
  DEFAULT_NO_SEO_DOC,
  META_DESCRIPTION_CHAR_LIMIT,
} from '../../config';
import { CourseInfo } from '../../types';
import { trimEllip } from '../../helpers';

type SeoDoc = {
  title: string;
  description: string;
};

const getReviewTitle = (prop: CourseInfo): SeoDoc => {
  return {
    title: `${prop.courseId} Reviews - ${prop.title} - CUtopia`,
    description: trimEllip(
      prop.description || DEFAULT_HEAD.description,
      META_DESCRIPTION_CHAR_LIMIT
    ),
  };
};

/* Identify by key id from get static prop */
const propMapping = {
  c: getReviewTitle,
};

const pathMapping: Record<string, SeoDoc | false> = {
  '/planner': {
    title: 'Course Planner - CUtopia',
    description:
      'Plan your coursework with all the tools you need. It provides timetable clash detection, workload and credits computation, and more',
  },
  '/review': {
    title: 'Course Review - CUtopia',
    description:
      'Share your opinions and make informed decisions about coursework. It provides detailed reviews and quantitive information in different metrics.',
  },
  '/about': false,
};

const makeHead = (pageProps, pagePath): SeoDoc | false => {
  let doc = null;
  // For path derived head
  doc = pathMapping[pagePath];
  // For no-crawl pages
  if (doc === false) return doc;
  // For prop derived head
  for (const key in propMapping) {
    const prop = pageProps[key];
    if (prop) {
      doc = propMapping[key](prop);
      break;
    }
  }
  // For default head
  return doc || DEFAULT_HEAD;
};

type Prop = {
  pageProps: any;
  pagePath: string;
};

const HeadSeo: FC<Prop> = ({ pageProps, pagePath }) => {
  const seoDoc = makeHead(pageProps, pagePath);
  const { title, description } = seoDoc || DEFAULT_NO_SEO_DOC;
  return (
    <NextSeo
      title={title}
      description={description}
      noindex={seoDoc === false}
      nofollow={seoDoc === false}
    />
  );
};

export default HeadSeo;
