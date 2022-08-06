import { FC } from 'react';
import Head from 'next/head';
import { DEFAULT_HEAD, META_DESCRIPTION_CHAR_LIMIT } from '../../config';
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

const pathMapping: Record<string, SeoDoc> = {
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
};

const makeHead = (pageProps, pagePath): SeoDoc => {
  let doc = null;
  // For path derived head
  doc = pathMapping[pagePath];
  // For prop derived head
  for (const key in propMapping) {
    const prop = pageProps[key];
    if (prop) {
      doc = propMapping[key](prop);
      break;
    }
  }
  return doc || DEFAULT_HEAD;
};

type Prop = {
  pageProps: any;
  pagePath: string;
};

const HeadSeo: FC<Prop> = ({ pageProps, pagePath }) => {
  const { title, description } = makeHead(pageProps, pagePath);
  // <NextSeo title={title} description={description} />
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default HeadSeo;
