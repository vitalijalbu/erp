import React from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import FormProcess from "@/shared/processes/form-process";

const Edit = () => {

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
      return false;
  }

  const router = useRouter();
  const { id } = router.query;

  return (
    <FormProcess id={id} isModal={false}/>
  );
};

export default Edit;
