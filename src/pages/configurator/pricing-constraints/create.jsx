import React from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import FormBody from "@/shared/configurator/pricing-constraints/form-body";

const Create = () => {

  const router = useRouter();

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const backUrl = "/configurator/pricing-constraints";
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
