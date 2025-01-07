import UserPermissions from "./ability";

export default function({can, user}) {

    can('configurator.manage', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('configurator.manage');
    });

    can('workcenters.manage', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('workcenters.manage');
    });

}