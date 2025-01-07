import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getLotStockById } from "@/api/lots";
import UserPermissions from "@/policy/ability";
import {
  Row,
  Col,
  Form,
  Input,
  Table,
  Button,
  Typography,
  message
} from "antd";
const { Text } = Typography;
import PageActions from "@/shared/components/page-actions";
import { IconTools } from "@tabler/icons-react";



const Stock = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("warehouse_adjustments.management")) {
    return false;
  }
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const handleSubmit = async (values) => {
    setLoading(true);
    const {data, error} = await getLotStockById(values.idLot);
    if(!error) {
      const transformedData = data.stocks.map((stock) => ({
        ...data,
        ...stock,
      }));
      setData(transformedData);
    }
    else {
      setData([]);
      message.error(error?.response?.status == 404 ? "Lot not found": (error?.data?.response?.message || "Error during lot data retrieving"));
    }
    setLoading(false);
  };

  const tableColumns = [
    {
      title: "Lot",
      dataIndex: "IDlot",
      key: "IDlot",
      render: (IDlot) => <Text>{IDlot}</Text>,
    },
    {
      title: "Item",
      dataIndex: "IDitem",
      key: "IDitem",
      render: (IDitem, record) => <Text>{record?.item?.item}</Text>,
    },
    {
      title: "Description",
      dataIndex: ["item", "item_desc"],
      key: "item_desc",
      render: (item_desc) => <Text>{item_desc}</Text>,
    },
    {
      title: "Warehouse",
      dataIndex: ["warehouse", "desc"],
      key: "warehouse",
      render: (desc) => <Text>{desc}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      render: (text, record) => (
        record.IDstock ? (
          <Link href={`/adjustment/lots/${record.IDstock}`}>
            <Button icon={<IconTools />}>
              Go to adjustments manager page
            </Button>
          </Link>
        ) : null
      ),
    }
  ];

  return (
    <div className="page">
      <PageActions
        title="Adjustment lot"
        subTitle={"Search the lot to be corrected"}
      >
        <div className="page-subhead_root">
          <Form layout="inline" form={form} onFinish={handleSubmit}>
            <Form.Item
              name="idLot"
              label="Lot number"
              rules={[{ required: true }]}
            >
              <Input allowClear />
            </Form.Item>
            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                disabled={!form}
              >
                Apply filters
              </Button>
            </Form.Item>
          </Form>
        </div>
      </PageActions>
      <div className="page-content">
        <Row>
          <Col span={24}>
            <Table
              columns={tableColumns}
              dataSource={data}
              loading={loading}
              pagination={{
                hideOnSinglePage: true,
              }}
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default Stock;
