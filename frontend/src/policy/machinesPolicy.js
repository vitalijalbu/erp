import UserPermissions from "./ability";

export default function({can, user}) {

    can('machines.management', 'all', () => {
        if(UserPermissions.isAdmin(user)) {
            return true;
        }
        return user.is_authorized.includes("machines.manage");
    });

}