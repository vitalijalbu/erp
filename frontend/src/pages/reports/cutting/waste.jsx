import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { disableDate } from "@/hooks/date-picker";
import { getCuttingWasteReports, exportReportsCuttingWaste } from "@/api/reports/cutting";
import { Avatar, Form, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message} from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";

const Waste = () => {
        //Set page permissions
        if (!UserPermissions.authorizePage("report.show")) {
            return false;
        }
    /* set store filters for datatable */
    const [filters, setFilters] = useRecoilState(filterState);
    const router = useRouter();
  
    const tableColumns = [
        {
            title: "Lot",
            key: "lot",
            sorter: false,
            fixed: "left"
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            fixed: "left"
        },  
        {
            title: "Desc",
            key: "itemDesc",
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
            title: "Used qty",
            align: "right",
            key: "usedQty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Received qty",
            align: "right",
            key: "receivedQty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Waste qty",
            align: "right",
            key: "wasteQty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Waste percentage",
            align: "right",
            key: "wastePercentage",
            sorter: false,
            filterable: false,
            render: ({ wastePercentage }) => <Tag>{wastePercentage}</Tag>
        }
    ];

    const handleTableChange = async (params) => {
        if(filters?.[0] && filters?.[1]) {
            const {data, error} = await getCuttingWasteReports({
                ...params, 
                dateFrom: filters[0].format('YYYY-MM-DD'), 
                dateTo: filters[1].format('YYYY-MM-DD')
            });
            if(error) {
                message.error(error?.response?.data?.message || "Error during data fetching");
            }
            return data;
        }
        return [];
    };

    const exportData = async (params) => {
        const result = await exportReportsCuttingWaste({
            ...params, 
            dateFrom: filters[0].format('YYYY-MM-DD'), 
            dateTo: filters[1].format('YYYY-MM-DD')
        });
        return [result.data, `CSM_cutting_waste_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };
  
    return (
        <div className="page">
            <PageActions 
                title="Cutting Waste"
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

export default Waste;
