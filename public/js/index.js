/* eslint-disable */
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, logout } from './login';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

//DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const userDataForm = document.querySelector('.form-user-data');
const userPasswordForm = document.querySelector('.form-user-password');
const bookBtn = document.querySelector('#book-tour');

//DELEGATION
if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (userDataForm) {
    userDataForm.addEventListener('submit', e => {
        event.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value )
        form.append('email', document.getElementById('email').value)
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
    });
}
if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async e => {
        document.querySelector('.btn--save-password').textContent = 'Updating...';
        event.preventDefault();
        const passwordCurrent = document.getElementById('password-current')
            .value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm')
            .value;

        await updateSettings(
            { passwordCurrent, password, passwordConfirm }, 
            'password'
        );

        console.log('imhere');
        document.getElementById('password-current').textContent = '';
        document.getElementById('password').textContent = '';
        document.getElementById('password-confirm').textContent = '';   
        document.querySelector('.btn--save-password').innerText = 'Save Password';
    });
}

if(bookBtn) {
    bookBtn.addEventListener('click', e => {
        e.target.textContent = "Processing..."
        const { tourId } = e.target.dataset;
        bookTour(tourId);
    })
}
