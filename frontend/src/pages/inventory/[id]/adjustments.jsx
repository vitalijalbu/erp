import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getInventoryAdjusments, getInventoryById } from "@/api/inventory";
import { IconTrash, IconAlertCircle } from "@tabler/icons-react";
import { Row, Col, Menu, Typography, Table, Tag, Alert, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import Toolbar from "@/shared/inventory/toolbar";
import Datatable from "@/shared/datatable/datatable";
import { numberFormatter } from "@/hooks/formatter";
const { Text } = Typography;

const Adjustments = () => {
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


  //Handle API Fetch Data
  const handleTableChange = async (params) => {
    const filters = {
      ...params,
      idInventory: id
    }
    const {data, error} = await getInventoryAdjusments(filters);
    if(error) {
      message.error(error?.response?.data?.message || "Error during lot data fetching");
    }
    return data;
  };

  //Handle Export
  const exportData = async (params) => {
    const filters = {
      ...params,
      idInventory: id
    }
    const {data, error} = await getInventoryAdjusments(filters);
    if(error) {
      message.error(error?.response?.data?.message || "Error during lot data fetching");
    }
    return [data, "invenytory-adjustments.xlsx"];
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
      copyable: true
    },
    {
      title: "Description",
      key: "desc",
      sorter: false,
      filterable: false,
    },
    {
      title: "Qty",
      align: "right",
      key: "qty",
      type: 'qty',
      after: (record) => record.um,
      sorter: false,
      filterable: false
    },
    {
      title: "Sign",
      key: "segno",
      type: "bool",
      sorter: false,
      filterable: false,
      render: ({ segno }) => (
        <Tag color={segno === "+" ? "blue" : "red"}>
          {segno}
        </Tag>
      ),
    },
    {
      title: "Dimensions",
      key: "dimensions",
      sorter: false,
      filterable: false,
      render: ({ dimensions }) => <Text>{dimensions}</Text>,
    },
    {
      title: "Warehouse",
      key: "warehouse",
      sorter: false,
      render: ({ warehouse }) => <Text strong>{warehouse}</Text>,
    },
    {
      title: "Location",
      key: "location",
      sorter: false,
      render: ({ location }) => <Text strong>{location}</Text>,
    },
    {
      title: "Inventory date",
      key: "inventoryDate",
      filterable: false,
      sorter: false
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
        title={<>Adjustments inventory - <mark>{data?.desc}</mark></>}><Toolbar /></PageActions>
      <div className="page-content">
        <Row gutter={16}>
          <Col span={24}>
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              exportData={exportData}
              rowKey={(record) => record.id}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Adjustments;
