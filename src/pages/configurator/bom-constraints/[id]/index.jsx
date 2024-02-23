import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageBomConstraint from "@/shared/configurator/bom-constraints/page-bom-constraint";

const Index = () => {
  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const router = useRouter();
  const { id } = router.query;

  const backUrl = "/configurator/bom-constraints";

  const onUpdate = () => router.push(backUrl);
  const onDelete = () => router.push(backUrl);

  return (
    <PageBomConstraint
      id={id}
      title={<>Update Constraint <mark> {id}</mark></>}
      backUrl={backUrl}
      saveEnabled={true}
      deleteEnabled={true}
      onUpdate={onUpdate}
      onDelete={onDelete}
    />
  );
};

export default Index;
