import UserPermissions from "./ability";

export default function({can, user}) {

    can('production_order.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('order_production.manage');
    });

    can('split_order.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('split_order.manage');
    });

    can('merge_order.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('order_lot_merge.manage');
    });

    can('cutting_order.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('cuttings.manage');
    });

}