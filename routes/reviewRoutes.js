const express = require('express');
const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true }); //mergeParams used for nested routes, that is routes passed from a parent router [i.e. tours to reviews]

//all review routes require login
router.use(authController.protect);

//applies to url formats: /tours/20498sf323r8d/reviews AND /reviews
router
    .route('/')
    .get(authController.protect, reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    );
router
    .route('/:id')
    .get(reviewController.getReview)
    .patch(
        authController.restrictTo('user', 'admin'),
        reviewController.updateReview
    )
    .delete(
        authController.restrictTo('user', 'admin'),
        reviewController.deleteReview
    );

module.exports = router;
