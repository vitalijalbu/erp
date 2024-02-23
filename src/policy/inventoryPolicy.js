import UserPermissions from "./ability";

export default function({can, user}) {

    can('inventory.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('master_data.inventory.manage');
    });

}