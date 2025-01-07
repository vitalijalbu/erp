import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import { getMachineById } from "@/api/machines/machines";
import MachinesForm from "@/shared/machines/form-body";

const Edit = () => {

  // Set page permissions
  // TODO: change with final ones
  if (!UserPermissions.authorizePage("machines.management")) {
		return false;
  }

  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (router.isReady && id) {
      setLoading(true);
      getMachineById(id)
        .then((response) => {
          if (response.data) {
            setData(response.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [router.isReady, id]);

  return (
    <div className="page">
      <PageActions
        backUrl="/machines"
        loading={loading}
        title={<> Edit Machine - <mark>{data?.code}</mark></>}
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
      <Card loading={loading} title="Machine details">
        <MachinesForm machine={data} onLoading={(value) => setLoading(value)}/>
      </Card>
    </div>
  );
}

export default Edit;
