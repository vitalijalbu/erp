

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { disableDate } from "@/hooks/date-picker";
import { getCuttingHistoryReports } from "@/api/reports/cutting";
import { Avatar, Form, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";

const History = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    /* set store filters for datatable */
    const [filters, setFilters] = useRecoilState(filterState);
    const router = useRouter();
    const pageUrl = router.asPath;

    localStorage.setItem('pageUrl', pageUrl);

    const tableColumns = [
        {
            title: "Lot",
            key: "IDlot",
            sorter: false,
            filterable: false
        },
        {
            title: "Chiorino code",
            key: "chioCode",
            sorter: false,
            filterable: false
        },
        {
            title: "Executed date",
            key: "dataExec",
            type: "datetimetz",
            sorter: false,
            filterable: false
        },
        {
            title: "User",
            key: "username",
            sorter: false,
            filterable: false,
            render: ({ username }) => <Tag>{username}</Tag>
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Button onClick={() => { router.push(`/cutting/${record.IDlot}`) }}>
                    Cut order details
                </Button>
            )
        }
    ];

    const handleTableChange = async (params) => {
        if (filters?.[0] && filters?.[1]) {
            const { data, error } = await getCuttingHistoryReports({
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

    return (
        <div className="page">
            <PageActions title="Cutting history">
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
                        columns={tableColumns}
                        watchStates={[filters]}
                        rowKey={(record) => record.IDlot}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default History;
