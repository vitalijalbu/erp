import React, { useState, useCallback } from "react";
import { getStockValueDate, getStockValueDateExport } from "@/api/reports/stocks";
import UserPermissions from "@/policy/ability";
import dayjs from "dayjs";
import { currencyFormatter } from "@/hooks/formatter";
import {
    Form,
    DatePicker,
    Card,
    Space,
    Row,
    Col,
    Divider,
    Table,
    Statistic,
    message,
    Button,
    Tag,
    Typography,
    Alert,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
const { Text } = Typography;

const StockValue = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage(["report.show", "items_value.show"])) {
        return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState({ value: null });
    const [store, setStore] = useState({
        sum_value_on_loc_stock: 0,
        sum_value_on_loc_trans: 0,
        sum_value_on_loc_qualc: 0,
        sum: 0,
        numberOfLotWithUncheckedValue: 0,
    });

    const [reload, setReload] = useState(0);

    const handleTableChange = async (params) => {
        if (date.value) {
            setLoading(true);
            const filters = {
                ...params,
                date: dayjs(date.value).format("YYYY-MM-DD HH:mm"),
            };

            const { data, error } = await getStockValueDate(filters);

            const {
                sum_value_on_loc_stock,
                sum_value_on_loc_trans,
                sum_value_on_loc_qualc,
                sum,
                numberOfLotWithUncheckedValue,
            } = data; // Access the nested properties

            // Update the state with the new values
            setStore({
                sum_value_on_loc_stock,
                sum_value_on_loc_trans,
                sum_value_on_loc_qualc,
                sum,
                numberOfLotWithUncheckedValue,
            });
            setLoading(false);
            if (error) {
                message.error(error?.response?.data?.message || "Error during data fetching");
            }
            return data;
        }
        
        return [];
       
    };

    const exportData = async (params) => {
        if (date.value) {
            setLoading(true);
            const filters = {
                ...params,
                date: dayjs(date.value).format("YYYY-MM-DD HH:mm"),
            };
            const result = await getStockValueDateExport(filters);
            setLoading(false);
            return [result.data, "stock-value-on-date.xlsx"];
        }
    };

    const tableColumns = [
        {
            title: "ID",
            key: "id",
            render: (text, record, index) => index, 
            hidden: true
        },
        {
            title: "Item",
            description: "Item",
            key: "item",
            fixed: "left",
            copyable: true,
            sorter: false,
        },
        {
            title: "Description",
            description: "Description",
            key: "item_desc",
            filterable: false,
            sorter: false,
        },
        {
            title: "Item group",
            description: "Item group",
            key: "item_group",
            filterable: false,
            sorter: false,
        },
        {
            title: "S. qty",
            description: "Stock qty on stock location",
            align: "right",
            key: "qty_stock_stock",
            type: 'qty',
            after: (record) => record.um,
            filterable: false,
            sorter: false,
        },
        {
            title: "T. qty",
            description: "Stock qty on transit location",
            align: "right",
            key: "qty_stock_trans",
            type: 'qty',
            after: (record) => record.um,
            filterable: false,
            sorter: false,
        },
        {
            title: "Q. qty",
            description: "Stock qty on quality control location",
            align: "right",
            key: "qty_stock_qltco",
            type: 'qty',
            after: (record) => record.um,
            filterable: false,
            sorter: false,
        },
        {
            title: "S. val",
            description: "Stock value on stock location",
            align: "right",
            key: "tval_stock_stock",
            type: 'qty',
            after: (record) => record.um,
            filterable: false,
            sorter: false,
        },
        {
            title: "T. val",
            description: "Stock value on transit location",
            key: "tval_stock_trans",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "Q. val",
            description: "Stock value on quality control location",
            key: "tval_stock_qltco",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "SL. min",
            description: "Stock limit min (sum of min limits on warehouses)",
            key: "qty_min",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "SL. max",
            description: "Stock limit max (sum of max limits on warehouses)",
            key: "qty_min",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "SL",
            description: "Stock limit indicator O=OK, K=KO",
            filterable: false,
            sorter: false,
            key: "alert_stock_limit",
            render: (text, record) => {
                let alert_stock_limit_i = 0;
                if (record.qty_min !== null && record.qty_max !== null) {
                    if (record.qty_stock_stock < record.qty_min && record.qty_min !== 0) {
                        alert_stock_limit_i = "K";
                    }

                    if (record.qty_stock_stock > record.qty_max && record.qty_max !== 0) {
                        alert_stock_limit_i = "K";
                    }

                    if (alert_stock_limit_i === 0) {
                        alert_stock_limit_i = "";
                    }

                    return <Tag color={alert_stock_limit_i === "O" ? "green" : "red"}>{alert_stock_limit_i}</Tag>;
                }

                return null;
            },
        },
        {
            title: "Currency",
            key: "currency",
            filterable: false,
            sorter: false,
            render: ({ currency }) => <Tag>{currency}</Tag>,
        },
        {
            title: "S.p.mm",
            description: "Sold previus month",
            key: "qty_sold_1mm",
            dataIndex: "qty_sold_1mm",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "S.p.3mm/3",
            description: "Sold previus 3 months",
            key: "qty_sold_3mm",
            dataIndex: "qty_sold_3mm",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "S.p.12mm/12",
            description: "Sold previus 12 months",
            key: "qty_sold_12mm",
            dataIndex: "qty_sold_12mm",
            type: "number",
            filterable: false,
            sorter: false,
        },
        {
            title: "Idx 1mm",
            description: "Warehouse stock index for 1 month",
            key: "idx_1mm",
            type: "number",
            filterable: false,
            sorter: false,
            render: (record) => (record.qty_sold_1mm !== 0 ? record.qty_stock_stock / record.qty_sold_1mm : '&infin;'),

        },
        {
            title: "Idx 3mm",
            description: "Warehouse stock index for 3 months",
            key: "idx_3mm",
            type: "number",
            filterable: false,
            sorter: false,
            render: (record) => (record.qty_sold_3mm !== 0 ? record.qty_stock_stock / record.qty_sold_3mm : '&infin;'),
        },
        {
            title: "Idx 12mm",
            description: "Warehouse stock index for 12 months",
            key: "idx_12mm",
            type: "number",
            filterable: false,
            sorter: false,
            render: (record) => (record.qty_sold_12mm !== 0 ? record.qty_stock_stock / record.qty_sold_12mm : '&infin;'),

        },
    ];

    return (
        <div className="page">
            <PageActions title="Report stock value on date">
                <Form layout="inline" form={form} onFinish={(values) => setDate({ value: values["date"] })}>
                    <Form.Item name="date" label="Select date" rules={[{ required: true }]}>
                        <DatePicker showTime allowClear format="YYYY-MM-DD HH:mm" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Apply filters
                    </Button>
                </Form>
            </PageActions>
            <div className="page-content">
                <Row className="mb-3">
                    <Col span={24}>
                        <Card loading={loading}>
                            <Space split={<Divider type="vertical" />} size="large" style={{ width: "100%" }}>
                                <Statistic
                                    title="Total stock value to date on locations stock"
                                    value={currencyFormatter(store.sum_value_on_loc_stock)}
                                />

                                <Statistic
                                    title="Total stock value to date on locations transit"
                                    value={currencyFormatter(store.sum_value_on_loc_trans)}
                                />

                                <Statistic
                                    title="Total stock value to date on locations quality"
                                    value={currencyFormatter(store.sum_value_on_loc_qualc)}
                                />
                                <Statistic
                                    title="Total stock value to date"
                                    value={currencyFormatter(store.sum_value_on_loc_stock)}
                                />
                            </Space>
                            <Divider />
                            <Text>{`(lots without checked value: ${store.numberOfLotWithUncheckedValue})`}</Text>
                        </Card>
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Datatable
                            style={{ whiteSpace: "pre" }}
                            exportData={exportData}
                            fetchData={handleTableChange}
                            watchStates={[date, reload]}
                            columns={tableColumns}
                            rowKey="id"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default StockValue;
