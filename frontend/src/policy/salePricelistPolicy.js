
import UserPermissions from "./ability";

export default function({can, user}) {

    can('sales_price_lists.manage', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sales_price_lists.manage');
    });

}