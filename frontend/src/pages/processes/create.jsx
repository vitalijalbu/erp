import React from "react";
import UserPermissions from "@/policy/ability";
import FormProcess from "@/shared/processes/form-process";

const Create = () => {

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
      return false;
  }

  return (
    <FormProcess isModal={false}/>
  );
};

export default Create;
