import UserPermissions from "./ability";

export default function({can, user}) {

    can('items.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('master_data.items.manage');
    });

    can('items_value.show', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('items.value.show');
    });

    can('items_value.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('items.value.manage');
    });

    can('items_receipts.management', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('items_receipts.manage');
    });

    can('items_stocks.show', 'all', (v) => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('stocks_items.show');
    });

}