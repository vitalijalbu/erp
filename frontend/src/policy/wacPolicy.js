import UserPermissions from "./ability";

export default function({can, user}) {

    can('wac.show', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('wac.show');
    });

    can('wac.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('wac.manage');
    });

}