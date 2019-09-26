const stripe = require('stripe')('sk_test_ypVwb2dv4a4MlU8ptjLEISqk00AOPQNrDP');

// could not get next line below to work, had to hardcode it (above)
// const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour = require('./../models/tourModel');
const User = require('./../models/userModel');
const Booking = require('./../models/bookingModel');

const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
    //1) get tour
    const tour = await Tour.findById(req.params.tourId);

    //2)
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        //success_url: `${req.protocol}://${req.host}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
        success_url: `${req.protocol}://${req.get(
            'host'
        )}/my-tours?alert=booking`,
        cancel_url: `${req.protocol}://${req.host}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [
                    `${req.protocol}://${req.get('host')}/img/tours/${
                        tour.imageCover
                    }`
                ],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    });

    //3) send session to client
    res.status(200).json({
        status: 'success',
        session
    });
});

// exports.createBookingCheckout = catchAsync(async (req, res, next) => {
//     const { tour, user, price } = req.query;
//     if (!tour && !user && !price) return next();
//     await Booking.create({ tour, user, price });
//     return res.redirect('/');
// });

const createBookingCheckout = async session => {
    const tour = session.client_reference_id;
    const user = (await User.findOne({ email: session.customer_email })).id;
    const price = session.display_items[0].amount / 100;
    await Booking.create({ tour, user, price });
};

exports.webhookCheckout = (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    let event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === 'checkout.session.completed')
        createBookingCheckout(event.data.object);

    res.status(200).json({ received: true });
};

exports.getBooking = factory.getOne(Booking, { path: 'bookings' });
exports.getAllBookings = factory.getAll(Booking, { path: 'bookings' });
exports.createBooking = factory.createOne(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
