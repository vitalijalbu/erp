import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import UserForm from "@/shared/users/form";

const Edit = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("users.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;

    return (
        <>
            <UserForm id={id} />
        </>
    );
};

export default Edit;
