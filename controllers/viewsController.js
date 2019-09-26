const Tour = require('../models/tourModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const Booking = require('../models/bookingModel');

exports.alerts = (req, res, next) => {
    const { alert } = req.query;
    if (alert === 'booking')
        res.locals.alert =
            'Your booking was successful. Please see your email for confirmation. It may be a few minutes before your booking shows up on this page.';
    next();
};
exports.getOverview = catchAsync(async (req, res) => {
    //1) Get Tour
    const tours = await Tour.find();

    //2) Build Template

    //3) Render website

    res.status(200).render('overview', {
        title: 'All tours',
        tours
    });
});
exports.getTourDetails = catchAsync(async (req, res, next) => {
    //1) Get Tour, guides, reviews
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
        path: 'reviews',
        fields: 'review rating user'
    });
    if (!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }

    //2) Render website

    res.status(200).render('tour', {
        title: `${tour.name} Tour`,
        tour
    });
});

exports.getLogin = (req, res) => {
    res.status(200).render('login', {
        title: 'User Login'
    });
};

exports.getAccount = (req, res) => {
    res.status(200).render('account', {
        title: 'Your account'
    });
};

exports.getMyTours = catchAsync(async (req, res, next) => {
    //1) find bookings
    const bookings = await Booking.find({ user: req.user.id });

    //2) find tours
    const tourIds = bookings.map(el => el.tour);

    const tours = await Tour.find({ _id: { $in: tourIds } });

    res.status(200).render('overview', {
        title: 'My Tours',
        tours
    });
});

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );
    res.status(200).render('account', {
        title: 'Your account',
        user: updatedUser
    });
});
