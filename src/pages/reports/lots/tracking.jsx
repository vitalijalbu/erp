

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as dayjs from 'dayjs';
import UserPermissions from "@/policy/ability";
import { disableDate } from "@/hooks/date-picker";
import { getLotTrackingReport, exportReportsTracking } from "@/api/reports/lots";
import { Avatar, Form, Input, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";
import { useValidationErrors } from "@/hooks/validation-errors";
import { IconSettings, IconLayersIntersect, IconSearch } from "@tabler/icons-react";


const Tracking = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    /* set store filters for datatable */
    const [form] = Form.useForm();
    const router = useRouter();
    const validationErrorsBag = useValidationErrors();
    const [lot, setLot] = useState({ value: null }); //using object to trigger also on same value set
    const [enableSearch, setEnableSearch] = useState(false);
    const [loading, setLoading] = useState(false);
    const pageUrl = router.asPath;

    localStorage.setItem('pageUrl', pageUrl);

    useEffect(() => {
        if (router.isReady && router?.query?.idLot) {
            form.setFieldValue('idLot', router.query.idLot);
            setLot({ value: router.query.idLot });
        }
    }, [router.isReady])

    const tableColumns = [
        {
            title: "Trans. data",
            key: "data_exec",
            type: 'datetimetz',
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
            title: "Lot",
            description: "Lot code",
            key: "IDlot",
            sorter: false,
            filterable: false,
            render: (record) => <Tag color={record['IDlot'] == lot.value ? 'red' : null}>{record['IDlot']}</Tag>
        },
        {
            title: "Lot previus origin supplier",
            key: "username",
            sorter: false,
            filterable: false,
            render: (record) => (
                <>
                  {record['IDlot_padre'] && <Tag>{record['IDlot_padre']}</Tag>}
                  {record['IDlot_origine'] && <Tag>{record['IDlot_origine']}</Tag>}
                  {record['IDlot_fornitore'] && <Tag>{record['IDlot_fornitore']}</Tag>}
                </>
              )        
        },
        {
            title: "Whs-Loc",
            description: "Warehouse location",
            key: "usedQty",
            sorter: false,
            filterable: false,
            render: (record) => `${record['wdesc']} ${record['wldesc']}`
        },
        {
            title: "Sign",
            key: "segno",
            type: "bool",
            sorter: false,
            filterable: false,
            render: ({ segno }) => (
                <Tag color={segno === "+" ? "blue" : "red"}>
                  {segno}
                </Tag>
              ),
        },
        {
            title: "Trans. Type",
            width: "8%",
            key: "ttdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "BP",
            description: "Business Partner",
            key: "bpdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            width: "8%",
            align: "right",
            key: "qty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Dimensions",
            key: "dimensions",
            sorter: false,
            filterable: false
        },
        {
            title: "Ord. ref.",
            description: "Order reference",
            key: "ord_rif",
            sorter: false,
            filterable: false
        },
        {
            title: "Username",
            key: "username",
            sorter: false,
            filterable: false,
            render: ({ username }) => <Tag>{username}</Tag>
        },
        {
            title: "Comp.\\Cutt. ord.",
            key: "wastePercentage",
            sorter: false,
            filterable: false,
            render: (record) => (
                <>
                    <Space.Compact>
                        {record["NumComp"] != 0 && (
                            <Link title="Go to production order" href={`/production/${record['IDlot']}`}>
                                <Button className="btn-info" icon={<IconSettings />}></Button>
                            </Link>
                        )}
                        {record["NumCut"] != 0 && (
                            <Link title="Go to cutting manager" href={`/cutting/${record['IDlot']}`}>
                                <Button className="btn-info" icon={<IconLayersIntersect />}></Button>
                            </Link>
                        )}
                        {record["OrdPrdLot"] != 0 && (
                            <Link title="Component: go to production order" href={`/production/${record['OrdPrdLot']}`}>
                                <Button className="btn-info" icon={<IconSettings />}></Button>
                            </Link>
                        )}
                    </Space.Compact>
                </>
            )
        }
    ];

    const idLot = Form.useWatch('idLot', form);

    const handleTableChange = async (params) => {
        setLoading(true);
        validationErrorsBag.clear();
        if (lot.value) {
            const { data, error, validationErrors } = await getLotTrackingReport(lot.value, params);
            if (error) {
                if (validationErrors) {
                    validationErrorsBag.setValidationErrors(validationErrors);
                }
                message.error(error?.response?.data?.message || "Error during data fetching");
            }
            setLoading(false);
            return { data: data };
        }
        setLoading(false);
        return [];
    };

    const exportData = async (params) => {
        const result = await exportReportsTracking(lot.value, params);
        if (!result.error) {
            return [result.data, `CSM_lot_tracking_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
        }
    };

    return (
        <div className="page">
            <PageActions
                title="Lot Tracking"
            >
                <Space>
                    <Form form={form} layout="inline">
                        <Form.Item name="idLot" {...validationErrorsBag.getInputErrors('idLot')}>
                            <Input placeholder="Lot" allowClear/>
                        </Form.Item>
                    </Form>
                    <Button
                        type="primary"
                        icon={<IconSearch/>}
                        loading={loading}
                        onClick={() => {
                            setLot({ value: form.getFieldValue('idLot') });
                        }}
                        disabled={!idLot || !idLot.length}
                    >
                        Tracking Lot
                    </Button>
                </Space>
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        exportData={exportData}
                        columns={tableColumns}
                        watchStates={[lot]}
                        rowKey={(record) => JSON.stringify(record)}
                        pagination={false}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default Tracking;
