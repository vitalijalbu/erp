import UserPermissions from "./ability";

export default function({can, user}) {

    can('bp.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('bp.manage');
    });
    can('bp.block', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('bp.block');
    });
}