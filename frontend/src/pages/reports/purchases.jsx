import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { getOpenPurchases, getOpenPurchasesExport } from "@/api/reports/purchases";
import { Alert, Avatar, Form, Space, Row, Col, Divider, Switch, Table, Button, message, DatePicker, Tag, Typography } from "antd";
import Datatable from "@/shared/datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { dateTZFormatter } from "@/hooks/formatter"
const { Text } = Typography;
const { RangePicker } = DatePicker;


const Purchases = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    const [loading, setLoading] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(null);

    const handleTableChange = async (params) => {
        const { data, error } = await getOpenPurchases(
            params
        );
        if (error) {
            message.error(error?.response?.data?.message || "Error during data fetching");
            setLastUpdate(null);
        }
        else {
            setLastUpdate(data.lastUpdate);
        }
        return data;
    };

    const exportData = async (params) => {
        const { data, error } = await getOpenPurchasesExport(
            params
        );
        if (!error) {
            return [data, `CSM_purchase_order_from_biella_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
        }
        else {
            message.error("Error during data export");
        }
        if (error) {
            message.error(error?.response?.data?.message || "Error during data export");
        }
    };

    const tableColumns = [
        {
            title: "Sales order",
            key: "salesOrder",
            sorter: false,
            filterable: true
        },
        {
            title: "Ref. order",
            key: "refOrder",
            sorter: false,
            filterable: true
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            filterable: true
        },
        {
            title: "CFG",
            key: "cfg",
            type: 'bool',
            sorter: false,
            filterable: false
        },
        {
            title: "L UM",
            key: "lUm",
            sorter: false,
            filterable: false
        },
        {
            title: "C UM",
            key: "cUm",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            key: "qty",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "W",
            key: "w",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "L",
            key: "l",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "P",
            key: "p",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "E",
            key: "e",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "I",
            key: "i",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "Ins. date",
            key: "dateIns",
            type: 'datetz',
            sorter: false,
            filterable: true
        },
        {
            title: "Plan date",
            key: "datePlan",
            type: 'datetz',
            render: (record) => dateTZFormatter(record.datePlan, 'YYYY-MM'),
            sorter: false,
            filterable: false
        },
        {
            title: "L-Box",
            key: "lBox",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "L-Shp",
            key: "lShp",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "L-Del",
            key: "lDel",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "L-Lft",
            key: "lLft",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "C-Box",
            key: "cBox",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "C-Shp",
            key: "cShp",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "C-Del",
            key: "cDel",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "C-Lft",
            key: "cLft",
            type: 'number',
            sorter: false,
            filterable: false
        }
    ];

    return (
        <div className="page">
            <PageActions
                title="Open purchase order from Chiorino S.p.A."
            />
            <Row>
                <Col span={24}>
                    <Datatable
                        style={{ whiteSpace: 'pre' }}
                        fetchData={handleTableChange}
                        columns={tableColumns}
                        rowKey={(record) => JSON.stringify(record)}
                        exportData={exportData}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Purchases;
