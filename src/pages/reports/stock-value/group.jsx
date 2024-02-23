import React, { useState } from "react";
import { getStockValue } from "@/api/reports/stocks";
import UserPermissions from "@/policy/ability";
import { currencyFormatter } from "@/hooks/formatter";
import {
  Card,
  Space,
  Row,
  Col,
  Divider,
  Statistic,
  Tag,
  Typography,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
const { Text } = Typography;

const StockValueGroup = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage(["report.show", "items_value.show"])) {
    return false;
  }
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const [store, setStore] = useState({
    sum: 0,
    sum_chiorino: 0,
    sum_not_chiorino: 0,
    lots_no_value: 0,
  });

  const handleTableChange = async (params) => {
    try {
      setLoading(true);
      const result = await getStockValue(params);
      const { sum, sum_chiorino, sum_not_chiorino, lots_no_value } =
        result.data; // Access the nested properties

      // Update the state with the new values
      setStore({ sum, sum_chiorino, sum_not_chiorino, lots_no_value });
      setLoading(false);
      return result.data;
    } catch (error) {
      // Handle any errors
      console.error(error);
      return [];
    }
  };

  const exportData = async (params) => {
    const result = await getStockValue(params);
    return [result.data, "stock-value-by-group.xlsx"];
  };

  const tableColumns = [
    {
      title: "ID",
      key: "id",
      render: (text, record, index) => index, 
      hidden: true
    },
    {
      title: "Item group",
      key: "item_group",
      sorter: false,
      render: ({ item_group }) => <Text>{item_group} </Text>,
    },
    {
      title: "CFG",
      description: "Configured Item",
      key: "cfg",
      sorter: false,
      filterable: false,
      render: ({ cfg }) => (
        <Tag color={cfg === 1 ? "green" : null}>{cfg === 1 ? "Yes" : "No"}</Tag>
      ),
    },
    {
      title: "Stock qty",
      align: "right",
      key: "stock_qty",
      type: 'qty',
      after: (record) => record.um
    },
    {
      title: "Value",
      key: "value",
      align: "right",
      type: "number",
      sorter: false
    },
    {
      title: "Currency",
      key: "currency",
      width: "8%",
      sorter: false,
      filterable: false,
      render: ({ currency }) => <Tag>{currency}</Tag>,
    },
    {
      title: "Chiorino Item",
      key: "chiorino_item",
      width: "8%",
      sorter: false,
      filterable: false,
      render: ({ chiorino_item }) => (
        <Tag color={chiorino_item === 1 ? "green" : null}>
          {chiorino_item === 1 ? "Yes" : "No"}
        </Tag>
      ),
    },
  ];
  return (
    <div className="page">
      <PageActions title="Report stock value by group" />
      <div className="page-content">
        <Row className="mb-3">
          <Col span={24}>
            <Card bordered loading={loading}>
              <Space
                split={<Divider type="vertical" />}
                size="large"
              >
                  <Statistic
                    title="Total stock value"
                    value={currencyFormatter(store.sum)}
                  />
                  <Statistic
                    title="Total Chiorino"
                    value={currencyFormatter(store.sum_chiorino)}
                  />
                  <Statistic
                    title="Total not Chiorino"
                    value={currencyFormatter(store.sum_not_chiorino)}
                  />
                </Space>
              <Divider />
              <Text>{`(lots without checked value: ${store.lots_no_value})`}</Text>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              exportData={exportData}
              pagination={false}
              rowKey="id"
            />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default StockValueGroup;
