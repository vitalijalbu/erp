import React, { useState, useCallback } from "react";
import { getStockLotDetails, getStockLotDetailsExport } from "@/api/reports/stocks";
import dayjs from "dayjs";
import UserPermissions from "@/policy/ability";
import { currencyFormatter } from "@/hooks/formatter";
import { Form, DatePicker, Card, Space, Row, Col, Divider, Table, Statistic, message, Button, Tag, Typography, Alert } from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
const { Text } = Typography;

const LotDetail = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage(["report.show", "items_value.show"])) {
        return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState({ value: null });

    const handleTableChange = async (params) => {
        setLoading(true);
        if (date.value) {
            const filters = {
                ...params,
                date: dayjs(date.value).format("YYYY-MM-DD HH:mm"),
            };

            const { data, error } = await getStockLotDetails(filters);
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
            const result = await getStockLotDetailsExport(filters);
            setLoading(false);
            return [result.data, "stock-value-detail.xlsx"];
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
            key: "item",
            copyable: true,
            sorter: false,
            filterable: false
        },

        {
            title: "Description",
            key: "item_desc",
            sorter: false,
            filterable: false
        },
        {
            title: "Lot",
            description: "Lot code",
            key: "IDlot",
            copyable: true,
            sorter: false,
            filterable: false
        },
        {
            title: "Warehouse",
            key: "wdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Wh. location",
            description: "Warehouse location",
            key: "wldesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Ev.",
            description: "Location evaluated (Yes/No)",
            key: "stock_valorized_wac",
            type: "bool",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            description: "Quantity on date",
            key: "qty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        }, {
            title: "Value",
            description: "Value of entire lot",
            key: "lotVal",
            type: 'number',
            sorter: false,
            filterable: false
        }, {
            title: "Date lot ori.",
            description: "Date of lot origin",
            key: "dateLotOri",
            type: 'datetime',
            sorter: false,
            filterable: false
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
                <Row>
                    <Col span={24}>
                        <Datatable
                            style={{ whiteSpace: "pre" }}
                            exportData={exportData}
                            fetchData={handleTableChange}
                            watchStates={[date]}
                            columns={tableColumns}
                            rowKey="id"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default LotDetail;
