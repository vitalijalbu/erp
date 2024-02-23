import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import FormBody from "@/shared/configurator/pricing-constraints/form-body";

const Index = () => {
  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }



  return (
    <FormBody/>
  );
};

export default Index;
