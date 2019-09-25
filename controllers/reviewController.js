const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
    if (!req.body.tour) req.body.tour = req.params.tourId;
    req.body.user = req.user.id; // comes from protect middleware (authController) which gets it from token
    next();
};
exports.createReview = factory.createOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
