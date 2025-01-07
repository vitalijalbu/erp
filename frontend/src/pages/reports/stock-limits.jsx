

import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import * as dayjs from 'dayjs';
import { disableDate } from "@/hooks/date-picker";
import { getAllWarehouses } from "@/api/warehouses";
import { getStockLimitsReports, getStockLimitsExport } from "@/api/reports/stocks";
import { Avatar, Form, Input, Select, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { useValidationErrors } from "@/hooks/validation-errors";

const StockLimits = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    /* set store filters for datatable */
    const router = useRouter();
    const [form] = Form.useForm();
    const [warehouses, setWarehouses] = useState([]);
    const [selectedWarehouse, setSelectedWarehouse] = useState(false);
    const validationErrorsBag = useValidationErrors();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { data, error } = await getAllWarehouses();
            if (!error) {
                setWarehouses([
                    {
                        label: 'All',
                        value: '',
                    },
                    ...data.map((w) => ({
                        label: w.desc,
                        value: w.IDwarehouse
                    }))
                ]);
            }
            else {
                message.error("Error during warehouses loading");
            }
        })();
    }, []);

    const warehouseSelectValue = Form.useWatch('idWarehouse', form);

    const tableColumns = [
        {
            title: "Warehouse",
            key: "wdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            filterable: false
        },
        {
            title: "Desc.",
            key: "itemDesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty stock on wh.",
            key: "qtyStockWh",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Qty stock all wh.",
            key: "qtyStock",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Qty min",
            key: "qtyMin",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Qty max",
            key: "qtyMax",
            type: 'number',
            sorter: false,
            filterable: false
        },
    ];

    const selectWarehouse = () => {
        setSelectedWarehouse({ value: form.getFieldValue('idWarehouse') });
    }

    const handleTableChange = async (params) => {
        if (selectedWarehouse === false) {
            return [];
        }
        setLoading(true);
        validationErrorsBag.clear();
        const { data, error, validationErrors } = await getStockLimitsReports(
            selectedWarehouse?.value,
            params
        );
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during data fetching");
        }
        setLoading(false);
        return data;
    };

    const exportData = async (params) => {
        const { data, error, validationErrors } = await getStockLimitsExport(
            selectedWarehouse?.value,
            params
        );
        if (!error) {
            return [data, `CSM_stock_limits_situation_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
        }
        else {
            message.error("Error during data export");
        }
    };

    return (
        <div className="page">
            <PageActions title="Stock limit situation">
                <Space>
                    <Form layout="inline" form={form}>
                        <Form.Item name="idWarehouse" {...validationErrorsBag.getInputErrors('idWarehouse')}>
                            <Select options={warehouses} allowClear/>
                        </Form.Item>
                        <Button disabled={warehouseSelectValue === undefined} loading={loading} type="primary" onClick={selectWarehouse}>
                            Search
                        </Button>
                    </Form>
                </Space>
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        columns={tableColumns}
                        watchStates={[selectedWarehouse]}
                        rowKey={(record) => JSON.stringify(record)}
                        exportData={exportData}
                        pagination={false}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default StockLimits;
