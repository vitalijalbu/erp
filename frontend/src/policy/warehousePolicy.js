import UserPermissions from "./ability";

export default function({can, user}) {

    can('warehouses.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('master_data.warehouses.manage');
    });

    can('warehouse_locations.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('master_data.locations.manage');
    });

    can('warehouse_adjustments.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('warehouse_adjustments.manage');
    });

}