import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageConstraint from "@/shared/configurator/configuration/page-constraint";

const Index = () => {

  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const router = useRouter();
  const { id } = router.query;

  const backUrl = "/configurator/constraints";

  const onUpdate = () => router.push(backUrl);
  const onDelete = () => router.push(backUrl);

  return (
    <PageConstraint 
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
