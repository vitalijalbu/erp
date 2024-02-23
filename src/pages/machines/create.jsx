import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import MachinesForm from "@/shared/machines/form-body";

const Create = (props) => {

  // Set page permissions
  // TODO: change with final ones
  if (!UserPermissions.authorizePage("machines.management")) {
		return false;
  }

  const [loading, setLoading] = useState(false);

  return (
    <div className="page">
      <PageActions
        backUrl="/machines"
        title={'Add new Machine'}
        loading={loading}
        extra={[
          <Button
            key="submit"
            htmlType="submit"
            type="primary"
            form="machine-form"
            loading={loading}
          >
            Save
          </Button>
        ]}
      />
      <Card loading={loading}>
        <MachinesForm onLoading={(value) => setLoading(value)} />
      </Card>
    </div>
  );
}

export default Create;
