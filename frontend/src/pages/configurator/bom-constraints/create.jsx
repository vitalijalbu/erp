import React from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import PageBomConstraint from "@/shared/configurator/bom-constraints/page-bom-constraint";

const Create = () => {

  const router = useRouter();

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const backUrl = "/configurator/bom-constraints";
  const onSave = () => router.push(backUrl);

  return (
    <PageBomConstraint 
      title="Add new BOM Constraint"
      saveEnabled={true}
      onSave={onSave}
      backUrl={backUrl}
    />
  );
};

export default Create;
