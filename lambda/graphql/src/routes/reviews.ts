import Review from 'mongodb/models/review.model';
const router = require('express').Router();

router.route('/').post((req, res) => {
  const newReview = new Review(req.body);
  console.log(req.body);
  newReview.save()
    .then(response => res.json(response))
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
