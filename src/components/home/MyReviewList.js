import React from 'react';
import { Link } from 'react-router-dom';
import { RateReview } from '@material-ui/icons';
import { observer } from 'mobx-react-lite';

import './MyReviewList.css';
import MyListItem from '../ListItem';
import Loading from '../Loading';
import { getMMMDDYY } from '../../helpers/getTime';

const MyReviewList = ({ loading, reviews }) => (
  <div className="course-card">
    <div className="course-card-header center-row">
      <RateReview />
      <span className="course-card-header-title">My Reviews</span>
    </div>
    {
      loading ? (
        <Loading />
      ) : (
        <div className="reviews-container">
          {(reviews?.reviewIds).map(reviewId => {
            const [courseId, createdDate] = reviewId.split('#');

            return (
              <Link
                key={courseId}
                to={`/review/${courseId}`}
              >
                <MyListItem>
                  <div className="search-list-item column">
                    <span className="title">{courseId}</span>
                    <span className="caption">{getMMMDDYY(createdDate)}</span>
                  </div>
                </MyListItem>
              </Link>
            );
          })}
        </div>
      )
    }
  </div>
);

export default observer(MyReviewList);
