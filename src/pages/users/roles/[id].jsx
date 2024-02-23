import React, { useState } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import RoleForm from "@/shared/users/form-role";

const Edit = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("users.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
            <RoleForm id={id} />
        </>
    );
};

export default Edit;
