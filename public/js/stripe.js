/* eslint-disable */

import axios from "axios";
import { showAlert } from './alerts';

var stripe = Stripe('pk_test_TEb9TXO14Vtl0aCNwJr26Mop00WECfknZ9');

export const bookTour = async tourId => {
    
    try {
        //1) Get checkout session from API
        const session = await axios(`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`);
    
        console.log(session);
        //2> Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (error) {
        console.error(error);
        showAlert('error', error);
    }
}