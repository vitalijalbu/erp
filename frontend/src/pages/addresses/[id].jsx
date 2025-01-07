import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import AddressForm from "@/shared/addresses/form-body";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import { getAddressById } from "@/api/addresses/addresses";




const Edit = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("bp.management")) {
      return false;
  }
  const router = useRouter();
  const { id } = router.query
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);


  useEffect(() => {
    if (router.isReady && id) {
      setLoading(true);
      getAddressById(id)
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
        backUrl="/addresses"
        loading={loading}
        title={<> Edit Address - <mark>{data?.name}</mark></>}
        extra={[
          <Button
            key="submit"
            htmlType="submit"
            type="primary"
            form="address-form"
            loading={loading}
          // icon={ <IconPlus/>}
          >
            Save
          </Button>
        ]}
      />
      <Card loading={loading} title="Address details">
        <AddressForm address={data} onLoading={(value) => setLoading(value)}/>
      </Card>
    </div>
  );
};

export default Edit;
