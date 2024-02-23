import UserPermissions from "./ability";

export default function({can, user}) {

    can('report.show', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes('report.show');
    });

}