
import UserPermissions from "./ability";

export default function({can, user}) {

    can('sale_sequences.manage', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('sale_sequences.manage');
    });

}