import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getAllItemsEnabled } from "@/api/items";
import {
  Form,
  Input,
  Space,
  Row,
  Col,
  Divider,
  Table,
  Button,
  Typography,
  Avatar
} from "antd";
import PageActions from "@/shared/components/page-actions";
const { Text } = Typography;
import { IconArrowRight, IconTools } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";

const AddLots = (props) => {
  //Set page permissions
  if (!UserPermissions.authorizePage("warehouse_adjustments.management")) {
    return false;
  }
  const router = useRouter();
  const { idBP } = router.query;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  //Datatable handle change
  const handleTableChange = async (params) => {
    const result = await getAllItemsEnabled(params);
    return result.data;
  };




  const tableColumns = [
    {
      title: "Item",
      key: "item",
      copyable: true
    },
    {
      title: "Description",
      key: "item_desc",
      dataIndex: "item_desc",
      sorter: false
    },
    {
      title: "UM",
      key: "um",
      dataIndex: "um",
      sorter: false,
      filterable: false,
    },
    {
      title: "Item group",
      key: "item_group",
      dataIndex: "item_group",
      sorter: false
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => (
        <Link href={`/adjustment/items/${record.id}`}>
          <Button icon={<IconTools />}>
            Go to adjustments manager page
          </Button>
        </Link>
      ),
    }
  ];
  return (
    <div className="page">
      <PageActions title="Select items" />
      <div className="page-content">
        <Row>
          <Col span={24}>
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              rowKey="idLot"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default AddLots;
