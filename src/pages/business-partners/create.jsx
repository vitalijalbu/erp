import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import FormBody from "@/shared/business-partners/form-body";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const router = useRouter();

    return (
        <>
            <FormBody />
        </>
    );
};

export default Create;
