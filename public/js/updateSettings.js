/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

//type is password or data (name/email)
export const updateSettings = async (data, type) => {
    try {
        console.log('imin');
        const url =
            type === 'password'
                ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
                : 'http://127.0.0.1:3000/api/v1/users/updateMe';
        const res = await axios({
            method: 'PATCH',
            url,
            data
        });
        if (res.data.status === 'success') {
            showAlert('success', `${type.toUpperCase()} updated successfully.`);
            // window.setTimeout(() => {
            //     location.assign('/me');
            // }, 1500);
        }
    } catch (error) {
        showAlert('error', error.response.data.message);
    }
    return;
};
