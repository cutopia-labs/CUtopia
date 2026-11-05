import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { getCatalogCourse } from '../../helpers/catalog';
import { CourseInfo } from '../../types';
import LoadingView from '../atoms/LoadingView';
import Page from '../atoms/Page';

import CoursePanel from './CoursePanel';

const CatalogCoursePage = ({ c }: { c?: CourseInfo }) => {
  const router = useRouter();
  const courseId =
    typeof router.query.courseId === 'string'
      ? router.query.courseId
      : c?.courseId || '';
  const [course, setCourse] = useState(c);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!courseId) return;
    let active = true;
    const refresh = async () => {
      try {
        const current = await getCatalogCourse(courseId);
        if (active && current) {
          setCourse(current as CourseInfo);
          setError('');
        } else if (active && !current && !c) {
          setError('Course data is temporarily unavailable. Please try again.');
        }
      } catch (error) {
        if (active) setError(error.message);
      }
    };
    void refresh();
    window.addEventListener('catalog-updated', refresh);
    return () => {
      active = false;
      window.removeEventListener('catalog-updated', refresh);
    };
  }, [courseId, c]);

  if (course && course.courseId === courseId) return <CoursePanel c={course} />;
  if (error)
    return (
      <Page>
        <p role="alert">{error}</p>
      </Page>
    );
  return <LoadingView loading />;
};

export default CatalogCoursePage;
