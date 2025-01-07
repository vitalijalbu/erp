import React, { useState } from "react";
import { calcYearToDate, calcYearToDateExport } from "@/api/reports/wac";
import { numberFormatter } from "@/hooks/formatter";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import dayjs from "dayjs";
import { Form, Row, Col, Button, DatePicker, message, Alert, Tag } from "antd";
import Datatable from "@/shared/datatable/datatable";


const Year = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("wac.management")) {
        return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState({ value: null });
    const [loaded, setLoaded] = useState(false);
    const [notChecked, setNotChecked] = useState([]);
    const [found, setFound] = useState(0);

    // Datatable handle change
    const handleTableChange = async (params) => {
        if (date.value) {
            const filters = {
                ...params,
                date: dayjs(date.value).format("YYYY-MM-DD"),
            };
            setLoading(true);
            const {data, error} = await calcYearToDate(filters);

            if(error) {
                message.error(error?.response?.data?.message || "Error during data fetching");
                setLoaded(false);
                setNotChecked([]);
                setFound(0);
            }
            else {
                setLoaded(true);
                setNotChecked(data.not_checked);
                setFound(data.recordsFiltered);
            }

            setLoading(false);
            return data;
        }
        return [];
    };


    const handleExport = async (params) => {
        const filters = {
            ...params,
            date: dayjs(date.value).format("YYYY-MM-DD"),
        };
        setLoading(true);
        const result = await calcYearToDateExport(filters);
        setLoading(false);

        return [result.data, `CSM_wac_calc_year_to_date_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    const tableColumns = [
        {
            title: "Y. layer",
            description: "Year layer",
            key: "year_layer",
            sorter: false,
            filterable: false,
            render: ({ year_layer }) => <Tag>{year_layer}</Tag>,
        },
        {
            title: "Item",
            key: "item",
            dataIndex: "item",
            sorter: false,
            copyable: true
        },
        {
            title: "Description",
            key: "item_desc",
            dataIndex: "item_desc",
            sorter: false,
            filterable: false,
        },
        {
            title: "Cfg",
            description: "Configured Item",
            key: "conf_item",
            type: "bool",
            sorter: false,
            filterable: false,
        },
        {
            title: "Qty beg. year",
            description: "Stock quantity at the beginning of the year (layer)",
            align: "right",
            key: "stock_qty_start_year",
            type: 'qty',
            after: (record) => record.um,
            filterable: false
        },
        {
            title: "Qty end year",
            description: "Stock quantity at the end of the year (layer)",
            align: "right",
            key: "stock_value_end_year",
            type: 'qty',
            after: (record) => record.um,
            filterable: false
        },
        {
            title: "V. beg. year",
            description: "Stock value at the beginning of the year (layer)",
            align: "right",
            key: "stock_value_start_year",
            type: "number",
            filterable: false
        },
        {
            title: "V. end year",
            description: "Stock value at the end of the year (layer)",
            align: "right",
            key: "stock_qty_end_year",
            type: "number",
            filterable: false
        },
        {
            title: "Purch. qty",
            description: "Purchased quantity from the beginning of the year to the searched date",
            align: "right",
            key: "purchased_qty",
            type: 'qty',
            after: (record) => record.um,
            filterable: false
        },
        {
            title: "Purch. value",
            description: "Purchased value from the beginning of the year to the searched date",
            align: "right",
            key: "purchased_value",
            type: 'number',
            filterable: false
        },
        {
            title: "Cons. qty",
            description: "Consumed quantity from the beginning of the year to the searched date",
            align: "right",
            key: "consumed_qty",
            type: 'qty',
            after: (record) => record.um,
            filterable: false
        },
        {
            title: "Stock qty",
            description: "Stock quantity at the searched date",
            align: "right",
            key: "qty_stock",
            type: 'qty',
            after: (record) => record.um,
            filterable: false
        },
        {
            title: "WAC",
            description: "Weighted average cost",
            align: "right",
            key: "avg_cost",
            dataIndex: "avg_cost",
            type: "number",
            filterable: false
        },
        {
            title: "S. WAC",
            description: "Warehouse stock valorized with weighted average cost",
            align: "right",
            key: "avg_cost_calc",
            type: "number",
            filterable: false,
            render: (record) => numberFormatter(record.avg_cost * record.qty_stock),
        },
        {
            title: "Notes",
            key: "notes",
            dataIndex: "notes",
            sorter: false,
            filterable: false,
        },
    ];

    return (
        <div className="page">
            <PageActions title="Calculate year to date WAC">
                <div className="page-subhead_root">
                    <Form layout="inline" form={form} onFinish={(values) => setDate({ value: values["date"] })}>
                        <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                            <DatePicker allowClear />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading}>
                                WAC
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </PageActions>
            <div className="page-content">
                {
                    loaded && found == 0 && (
                        <Alert 
                            className="mb-3"
                            type="error"
                            message="No data found, check if the layer of the previous year is present and set to definitive ... "
                        >
                            
                        </Alert>
                    )
                }
                <Row>
                    <Col span={24}>
                        <div style={{display: loaded ? 'block' : 'none' }}>
                            <Datatable 
                                style={{ whiteSpace: "pre" }} 
                                fetchData={handleTableChange} 
                                watchStates={[date]} 
                                exportData={handleExport}
                                columns={tableColumns} 
                                rowKey={(record) => record.idStock
                            } />
                        </div>
                    </Col>
                </Row>
                {
                    loaded && notChecked && notChecked.count > 0 && (
                        <Alert 
                            className="mt-3"
                            type="warning"
                            message={`The followings ${notChecked.count} lots are with unchecked value`}
                            description={notChecked.lots.map((lot) => <div>{lot}</div>)}
                        >
                            
                        </Alert>
                    )
                }
            </div>
        </div>
    );
};

export default Year;
