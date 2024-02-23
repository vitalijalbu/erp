import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getInventoryById, getInventoryLotsById } from "@/api/inventory";
import { Row, Col, Tag, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import Toolbar from "@/shared/inventory/toolbar";
import Datatable from "@/shared/datatable/datatable";


const Index = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("inventory.management")) {
    return false;
  }

  const router = useRouter();
  const { id } = router.query;

  const [loading, setLoading] = useState(false);
  const [totalData, setTotalData] = useState(0);
  const [data, setData] = useState(null);


  // Get Inventory info
  useEffect(() => {
    if (router.isReady) {
        setLoading(true);
        (async () => {
            const { data, error } = await getInventoryById(id)
            if (!error) {
                setData(data);
            }
            else {
                message.error("Error during item loading")
            }
            setLoading(false);
        })();
    }
}, [router.isReady]);

  const handleTableChange = async (params) => {
    const filters = {
      ...params,
      idInventory: id
    }
    const {data, error} = await getInventoryLotsById(filters);
    if(error) {
      message.error(error?.response?.data?.message || "Error during lot data fetching");
    }
    return data;
  };


  const tableColumns = [
    {
      title: "Lot",
      key: "lot",
      copyable: true,
      sorter: false
    },
    {
      title: "Item",
      key: "item",
      sorter: false,
      copyable: true,
    },
    {
      title: "Description",
      key: "desc",
      sorter: false,
      filterable: false,
    },
    {
      title: "Qty",
      key: "qty",
      align: "right",
      type: 'qty',
      after: (record) => record.um,
      sorter: false,
      filterable: false
    },
    {
      title: "Dimensions",
      key: "dimensions",
      sorter: false,
      filterable: false,
    },
    {
      title: "Warehouse",
      key: "warehouse",
      sorter: false,
      filterable: false,
    },
    {
      title: "Location",
      key: "location",
      sorter: false,
      filterable: false,
    },
    {
      title: "Inventory date",
      key: "inventoryDate",
      sorter: false,
      filterable: false,
    },
    {
      title: "Username",
      key: "username",
      sorter: false,
      render: ({ username }) => <Tag>{username}</Tag>,
    },

  ];




  return (
    <div className="page">
      <PageActions
        loading={loading}
        backUrl="/inventory"
        title={<>Details inventory - <mark>{data?.desc}</mark></>}><Toolbar /></PageActions>
      <div className="page-content">
        <Row gutter={16}>
          <Col span={24}>
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              rowKey={(record) => record.id}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Index;
