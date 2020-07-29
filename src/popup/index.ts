import 'bootstrap/dist/css/bootstrap.min.css';
import credentialsJson from './credentials.json';
import { IUser } from './models/User';
import { ICredentials } from './models/Credentials';
import { UserSwitcher } from './UserSwitcher';

document.addEventListener('DOMContentLoaded', () => {
    initalize();
});

function initalize() {
    credentialsJson.creds.forEach((creds: ICredentials) => {
        creds.users.forEach((user: IUser) => {
            user.customer = creds.customer;
            $('#username_selector').append(`<option value='${JSON.stringify(user)}'>${user.username}</option>`);

        });
    });
    handleUsernameDropdownSelect();

    $('#switch-btn').click(() => {
        const val = $('#username_selector option:selected').val();
        handleUserSwitch(JSON.parse(val as string) as IUser);
    });

    $('#username_selector').change(() => {
        handleUsernameDropdownSelect();
    });
}

function handleUsernameDropdownSelect() {
    $('#selected_user_info_area #detail_roles').empty();
    $('#notification_area').hide();
    const val = String($('#username_selector option:selected').val());
    const user = JSON.parse(val) as IUser;
    $('#selected_user_info_area #detail_customer').text(user.customer);
    user.roles.forEach((role: string) => {
        $('#selected_user_info_area #detail_roles').append(`<li>${role}</li>`);
    });
}

function handleUserSwitch(user: IUser) {
    const switcher = new UserSwitcher(user);
    return switcher.execute()
        .then(() => showSuccess(true))
        .catch((error: string) => {
            console.error('err ', error);
            showSuccess(false);
        });
}

function showSuccess(success: boolean) {
    $('#notification_area').show();
    if (success) {
        $('#notification_area .alert-success').show();
    } else {
        $('#notification_area .alert-danger').show();
    }
}
