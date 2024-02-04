// =============================
// Email: isak.vidinghoff@gmail.com
// www.isakvidinghoff.com
// =============================

import { Injectable } from '@angular/core';

@Injectable()
export class DBkeys {

    public static readonly CURRENT_USER = 'current_user';
    public static readonly USER_PERMISSIONS = 'user_permissions';
    public static readonly ACCESS_TOKEN = 'access_token';
    public static readonly REFRESH_TOKEN = 'refresh_token';
    public static readonly TOKEN_EXPIRES_IN = 'expires_in';

    public static readonly REMEMBER_ME = 'remember_me';

    public static readonly LANGUAGE = 'language';
    public static readonly HOME_URL = 'home_url';
    public static readonly THEME_ID = 'themeId';
    public static readonly SHOW_INVOICED_CHART = 'show_invoiced_chart';
    public static readonly SHOW_ORDERSTOCK_CHART = 'show_orderstock_chart';
    public static readonly SHOW_ORDERS_BY_PERSON_CHART = 'show_orders_by_person_chart';
    public static readonly ENABLE_PUSH_NOTIFICATIONS = 'enable_push_notifications';
}
