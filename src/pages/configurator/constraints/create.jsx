import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageConstraint from "@/shared/configurator/configuration/page-constraint";

const Create = () => {
  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }
  const router = useRouter();
 
  const backUrl = "/configurator/constraints";
  const onSave = () => router.push(backUrl);

  return (
    <PageConstraint 
      title="Add new Constraint"
      saveEnabled={true}
      onSave={onSave}
    />
  );
};

export default Create;
