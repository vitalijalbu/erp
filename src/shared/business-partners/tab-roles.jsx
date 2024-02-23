import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { Tabs, Col, Row } from "antd";
import _, { set } from "lodash";
import FormSales from "@/shared/business-partners/roles/forms/form-sales";
import FormShipping from "@/shared/business-partners/roles/forms/form-shipping";
import FormInvoice from "@/shared/business-partners/roles/forms/form-invoice";
import FormPurchases from "@/shared/business-partners/roles/forms/form-purchases";


const TabRoles = (props) => {
  const { data, changesWatcher } = props;
  // const [selected, setSelected] = useState(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState({});



  useEffect(() => {
    setLoading(true);
    if (router.isReady && data) {
      setRoles(data);
      setLoading(false);
    }
  }, [router.isReady, props])

  // Items tabs Nav
  const items = [
    {
      label: "Sales",
      key: "sales",
      children: <FormSales
        data={roles}
        id="sales"
        {...props}
      />,
    },
    {
      label: "Shipping",
      key: "shipping",
      children: <FormShipping
        data={roles}
        id='shipping'
        {...props}
      />,
    },
    {
      label: "Invoice",
      key: "invoice",
      children: <FormInvoice
        data={roles}
        id='invoice'
        {...props}
      />,
    },
    {
      label: "Purchases",
      key: "purchases",
      children: <FormPurchases
        data={roles}
        id='sales'
        {...props}
      />,
    }
  ];

  return (
      <Row gutter={16}>
        <Col span={24}>
          <Tabs loading={loading} items={items} tabPosition="left" defaultActiveKey="sales"/>
        </Col>
      </Row>
  );
};

export default TabRoles;

