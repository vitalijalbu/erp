import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import FormBody from "@/shared/business-partners/form-body";



const Index = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }

    return (
        <>
            <FormBody/>
        </>
    );
};

export default Index;
