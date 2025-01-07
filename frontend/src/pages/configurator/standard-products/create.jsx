import React, { useState } from "react";
import UserPermissions from "@/policy/ability";

import FormBody from "@/shared/configurator/standard-products/form-body";


const Create = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  return (
    <div className="page">
     <FormBody />
    </div>
  );
};

export default Create;
