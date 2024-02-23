import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { getCuttingActiveReports, exportReportsCuttingActive } from "@/api/reports/cutting";
import { printCuttingPlanPdf } from "@/api/cutting";
import { useExport } from "@/hooks/download";
import { Space, Row, Col, Button, DatePicker, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import Datatable from "@/shared/datatable/datatable";
import { IconEyeShare, IconPrinter, IconFileText } from "@tabler/icons-react";

const Active = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pageUrl = router.asPath;

    localStorage.setItem('pageUrl', pageUrl);
    console.log(pageUrl)

    //Printing order
    const printPlan = async (id) => {
        setLoading(id);
        const { data, error } = await printCuttingPlanPdf(id);
        if (!error) {
            useExport(data, "cutting_order.pdf");
            setLoading(null);
        }
        else {
            message.error("Error during cutting plan pdf generation");
            setLoading(null);
        }
        setLoading(null);
    }



    const tableColumns = [
        {
            title: "Date planned",
            key: "date_planned",
            sorter: false,
            filterable: false,
            type: 'datetz'
        },
        {
            title: "Date creation",
            key: "date_creation",
            sorter: false,
            filterable: false,
            type: 'datetz'
        },
        {
            title: "Lot in cutting",
            key: "IDlot",
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
            title: "Desc",
            key: "item_desc",
            sorter: false,
            filterable: false
        },
        {
            title: "Stock qty",
            align: "right",
            key: "qty_stock",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Plan. cuts qty",
            align: "right",
            key: "qty_planned",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Plan. cuts count",
            align: "right",
            key: "cuts",
            type: "number",
            sorter: false,
            filterable: false
        },
        {
            title: "Add. info",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <>
                    <Space.Compact>
                        <Link title="Go to cutting manager" href={`/cutting/${record['IDlot']}`}>
                            <Button icon={<IconEyeShare />} />
                        </Link>
                        <Button icon={<IconPrinter />} onClick={() => printPlan(record.IDlot)} loading={loading === record.IDlot}></Button>
                        <Button title={record["note"]} disabled={record["note"] == '' ? true : false} icon={<IconFileText />} />
                    </Space.Compact>
                </>

            )
        }
    ];

    const handleTableChange = async (params) => {
        const { data, error } = await getCuttingActiveReports(params);
        if (error) {
            message.error(error?.response?.data?.message || "Error during data fetching");
        }
        return { data: data };
    };

    const exportData = async (params) => {
        const result = await exportReportsCuttingActive(params);
        if (!result.error) {
            return [result.data, `CSM_cutting_active_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
        }
    };

    return (
        <div className="page">
            <PageActions title="Cutting Order Planned">
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        exportData={exportData}
                        columns={tableColumns}
                        rowKey={(record) => record.IDlot}
                        pagination={false}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Active;
