import React from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import PageBomConstraint from "@/shared/configurator/bom-constraints/page-bom-constraint";
import FormBody from "@/shared/configurator/routing-constraints/form-body";

const Create = () => {

  const router = useRouter();

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const backUrl = "/configurator/routing-constraints";
  const onSave = () => router.push(backUrl);

  return (
    <FormBody 
      saveEnabled={true}
      onSave={onSave}
      backUrl={backUrl}
    />
  );
};

export default Create;
