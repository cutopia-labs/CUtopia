import Head from 'next/head';
import { FC } from 'react';
import {
  DEFAULT_DESCRIPTION,
  META_DESCRIPTION_CHAR_LIMIT,
} from '../../constants/configs';
import { CourseInfo } from '../../types';
import { trimEllip } from '../../helpers';

type SeoDoc = {
  title: string;
  description: string;
};

const DEFAULT_HEAD = {
  title: 'CUtopia',
  description: META_DESCRIPTION_CHAR_LIMIT,
};

const getReviewTitle = (prop: CourseInfo): SeoDoc => {
  return {
    title: `${prop.courseId} Reviews - ${prop.title} - CUtopia`,
    description: trimEllip(
      prop.description || DEFAULT_DESCRIPTION,
      META_DESCRIPTION_CHAR_LIMIT
    ),
  };
};

/* Identify by key id from get static prop */
const mapping = {
  c: getReviewTitle,
};

type Prop = {
  pageProps: any;
};

const HeadSeo: FC<Prop> = ({ pageProps }) => {
  let doc = null;
  for (const key in mapping) {
    const prop = pageProps[key];
    if (prop) {
      doc = mapping[key](prop);
      break;
    }
  }
  const { title, description } = doc || DEFAULT_HEAD;
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
    </Head>
  );
};

export default HeadSeo;
