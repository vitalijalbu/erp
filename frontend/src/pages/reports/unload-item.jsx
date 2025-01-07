import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { disableDate } from "@/hooks/date-picker";
import { getUnloadItemReports, exportReportsUnloadItem } from "@/api/reports/items";
import { Avatar, Form, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";

const UnloadedItems = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    /* set store filters for datatable */
    const [filters, setFilters] = useRecoilState(filterState);
    const router = useRouter();

    const tableColumns = [
        {
            title: "Trans. Type",
            key: "transType",
            sorter: false,
            filterable: false
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            filterable: false,
            copyable: true
        },
        {
            title: "Description",
            key: "itemDesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Unloaded qty",
            align: "right",
            key: "unloadedQty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        }
    ];

    const handleTableChange = async (params) => {
        if (filters?.[0] && filters?.[1]) {
            const { data, error } = await getUnloadItemReports({
                ...params,
                dateFrom: filters[0].format('YYYY-MM-DD'),
                dateTo: filters[1].format('YYYY-MM-DD')
            });
            if (error) {
                message.error(error?.response?.data?.message || "Error during data fetching");
            }
            return data;
        }
        return [];
    };

    const exportData = async (params) => {
        const result = await exportReportsUnloadItem({
            ...params,
            dateFrom: filters[0].format('YYYY-MM-DD'),
            dateTo: filters[1].format('YYYY-MM-DD')
        });
        return [result.data, `CSM_unloaded_item_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    return (
        <div className="page">
            <PageActions
                title="Unloaded items by date"
            >
                <Space>
                    <RangePicker
                        allowClear
                        defaultValue={[filters?.[0], filters?.[1]]}
                        format={'YYYY-MM-DD'}
                        value={[filters?.[0], filters?.[1]]}
                        onChange={(val) => {
                            setFilters(val);
                        }}
                    />
                </Space>
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        exportData={exportData}
                        columns={tableColumns}
                        watchStates={[filters]}
                        rowKey={(record) => record.lot}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default UnloadedItems;
