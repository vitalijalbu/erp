import React, { useState, useEffect, useCallback, useMemo } from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import * as dayjs from 'dayjs';
import { getReportsStockWidth } from "@/api/reports/stocks";
import { Row, Col, DatePicker, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import Datatable from "@/shared/datatable/datatable";

const StockWidth = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    const router = useRouter();

    const tableColumns = [
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
            title: "Item",
            key: "item",
            copyable: true,
            sorter: false,
            filterable: false
        },
        {
            title: "Desc",
            key: "itemDesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Width",
            key: "width",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "m2",
            key: "m2",
            type: 'number',
            sorter: false,
            filterable: false
        },
    ];

    const handleTableChange = async (params) => {
        const { data, error } = await getReportsStockWidth(params);
        if (error) {
            message.error(error?.response?.data?.message || "Error during data fetching");
        }
        return data;
    };

    return (
        <div className="page">
            <PageActions title="Stock By Width Report">
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        columns={tableColumns}
                        rowKey={(record) => JSON.stringify(record)}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default StockWidth;
