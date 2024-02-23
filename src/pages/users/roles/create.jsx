import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import RoleForm from "@/shared/users/form-role";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("users.management")) {
        return false;
    }
    const router = useRouter();

    return (
        <>
            <RoleForm />
        </>
    );
};

export default Create;
