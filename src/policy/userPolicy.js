import UserPermissions from "./ability";

export default function({can, user}) {

    can('users.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('users.manage');
    });

    can('permissions.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('permissions.manage');
    });

    can('calendar.manage', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('permissions.manage');
    });
}