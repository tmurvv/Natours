const mongoose = require('mongoose');
const Tour = require('./tourModel');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, 'Review can not be empty.']
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now()
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Your name is required.']
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Tour name is required.']
        }
    },
    {
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

reviewSchema.pre(/^find/, function(next) {
    this.populate({
        path: 'user',
        select: 'name photo'
    });
    next();
});

reviewSchema.statics.calcAverageRatings = async function(tourId) {
    const stats = await this.aggregate([
        {
            $match: { tour: tourId }
        },
        {
            $group: {
                _id: '$tour',
                nRating: {
                    $sum: 1
                },
                avgRating: { $avg: '$rating' }
            }
        }
    ]);

    if (stats.length > 0) {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: stats[0].nRating,
            ratingsAverage: stats[0].avgRating
        });
    } else {
        await Tour.findByIdAndUpdate(tourId, {
            ratingsQuantity: 0,
            ratingsAverage: 4.5
        });
    }
};

reviewSchema.post('save', function() {
    //this.constructor points to current Model
    //for this.tour the THIS points to item being saved
    //Remember that another middleware adds the tour id to the review object before creating it
    this.constructor.calcAverageRatings(this.tour);
});

//add tour id to update/delete object
reviewSchema.pre(/^findOneAnd/, async function(next) {
    this.reviewObject = await this.findOne(); //a hack to get tourId down the pipeline to update rating info after saving
    next();
});
//update ratings fields
reviewSchema.post(/^findOneAnd/, async function() {
    await this.reviewObject.constructor.calcAverageRatings(
        this.reviewObject.tour
    );
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
