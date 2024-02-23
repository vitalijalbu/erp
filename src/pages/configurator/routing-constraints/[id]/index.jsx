import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageBomConstraint from "@/shared/configurator/bom-constraints/page-bom-constraint";
import FormBody from "@/shared/configurator/routing-constraints/form-body";

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
