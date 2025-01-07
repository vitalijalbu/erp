
import UserPermissions from "./ability";

export default function({can, user}) {

    can('sales.create', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sales.approved');
    }); 
    
    can('sales.approved', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sales.approved');
    });

    can('sales.canceled', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sales.canceled');
    });
    
    can('sales.closed', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sales.closed');
    });

}