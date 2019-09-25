/* eslint-disable */

import axios from "axios";
import { showAlert } from './alerts';

var stripe = Stripe('pk_test_TEb9TXO14Vtl0aCNwJr26Mop00WECfknZ9');

export const bookTour = async tourId => {
    
    try {
        //1) Get checkout session from API
        const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    
       //2> Create checkout form + charge credit card
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id
        });
    } catch (error) {
        console.error(error);
        showAlert('error', error);
    }
}