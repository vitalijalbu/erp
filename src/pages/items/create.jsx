import React from "react";
import UserPermissions from "@/policy/ability";
import FormBody from "@/shared/items/form-body";

const Create = () => {
    
    //Set page permissions
    if (!UserPermissions.authorizePage("items.management")) {
        return false;
    }
 
    return (
        <FormBody />
    );
};

export default Create;
