

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { getTransactionTypes, getTransactionHistory, getTransactionHistoryExport } from "@/api/transactions";
import { Form, Input, Select, Space, Row, Col, Button, DatePicker, Tag, message, Tooltip } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";
import { IconFileText, IconSettings } from "@tabler/icons-react";
import { useValidationErrors } from "@/hooks/validation-errors";


const TransactionHistory = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("report.show")) {
        return false;
    }
    /* set store filters for datatable */
    const [dateFilters, setDateFilters] = useRecoilState(filterState);
    const router = useRouter();
    const [form] = Form.useForm();
    const [filters, setFilters] = useState({});
    const [transTypes, setTransTypes] = useState([]);
    const [loaded, setLoaded] = useState(false);
    const validationErrorsBag = useValidationErrors();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        form.setFieldValue('dates', Object.values(dateFilters).map((d) => dayjs(d)));

        (async () => {
            const { data, error } = await getTransactionTypes();
            if (error) {
                message.error("Error during fetching of transaction types");
            }
            setTransTypes([{ label: 'ALL', value: '' }, ...data.map((t) => ({
                label: t.desc,
                value: t.IDtrantype
            }))]);
            form.setFieldValue('type', '');
            setLoaded(true);
        })();
    }, []);

    const tableColumns = [
        {
            title: "Trans. data",
            key: "dataExec",
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
            title: "Desc.",
            key: "itemDesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Lot",
            key: "idLot",
            sorter: false,
            filterable: false,
            render: ({ idLot }) => <Tag>{idLot}</Tag>,
        },
        {
            title: "Eur1",
            key: "eur1",
            sorter: false,
            filterable: false
        },
        {
            title: "whdesc",
            key: "username",
            sorter: false,
            filterable: false,
            render: ({ username }) => <Tag>{username}</Tag>,
        },
        {
            title: "Loc.",
            description: "Warehouse location",
            key: "whldesc",
            sorter: false,
            filterable: false
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
            key: "trdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            align: "right",
            key: "qty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Dim.",
            description: "Dimensions",
            key: "dimensions",
            sorter: false,
            filterable: false
        },
        {
            title: "B. partner",
            key: "bpdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Order ref.",
            key: "ordRif",
            sorter: false,
            filterable: false
        },
        {
            title: "Username",
            key: "username",
            sorter: false,
            filterable: false,
            render: ({ username }) => <Tag>{username}</Tag>,
        },
        {
            title: "Add. info",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                    <Space.Compact>
                        <Tooltip title={record.note}>
                                <Button key={0} disabled={!record.note} icon={<IconFileText />}/>
                            </Tooltip>
                            <Link title="Go to production order" href={`/production/${record['idLot']}`}>
                                <Button key={1} icon={<IconSettings />} disabled={!record["numComp"]}/>
                            </Link>
                            <Link title="Component: go to production order" href={`/production/${record['OrdPrdLot']}`} >
                                <Button key={2} icon={<IconSettings />} disabled={!record["ordPrdLot"]}/>
                            </Link>
                    </Space.Compact>
            )
        }
    ];

    const updateTransactions = () => {
        var filters = {};
        if (form.getFieldValue('dates')?.[0]) {
            filters['dateFrom'] = form.getFieldValue('dates')[0].format('YYYY-MM-DD');
        }
        if (form.getFieldValue('dates')?.[1]) {
            filters['dateTo'] = form.getFieldValue('dates')[1].format('YYYY-MM-DD');
        }
        if (form.getFieldValue('type')) {
            filters['idTranType'] = form.getFieldValue('type');
        }
        if (form.getFieldValue('item')) {
            filters['item'] = form.getFieldValue('item');
        }
        setFilters(filters);
    }

    const handleTableChange = async (params) => {
        if (!loaded) {
            return [];
        }
        setLoading(true);
        validationErrorsBag.clear();
        const { data, error, validationErrors } = await getTransactionHistory({
            ...params,
            ...filters
        });
        if (error) {
            if (validationErrors) {
                const dateErrors = validationErrors?.dateFrom || validationErrors?.dateTo ?
                    { dates: [validationErrors?.dateFrom, validationErrors?.dateTo] }
                    : {};

                validationErrorsBag.setValidationErrors({
                    ...validationErrors,
                    ...dateErrors
                });
            }
            message.error(error?.response?.data?.message || "Error during data fetching");

        }
        setLoading(false);
        return data;
    };

    const exportData = async (params) => {
        const { data, error } = await getTransactionHistoryExport({
            ...params,
            ...filters
        });
        return [data, `CSM_trans_hist_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    return (
        <div className="page">
            <PageActions title="Transaction history">
                <Space>
                    <Form layout="inline" form={form}>
                        <Form.Item name="dates" {...validationErrorsBag.getInputErrors('dates')}>
                            <RangePicker
                                format={'YYYY-MM-DD'}
                            />
                        </Form.Item>
                        <Form.Item name="type">
                            <Select
                                options={transTypes}
                            />
                        </Form.Item>
                        <Form.Item name="item">
                            <Input placeholder="Item Selection: leave empty for all items" />
                        </Form.Item>
                        <Button type="primary" loading={loading} onClick={updateTransactions}>
                            Search Transactions
                        </Button>
                    </Form>
                </Space>
            </PageActions>
            <Row>
                <Col span={24}>
                    <Datatable
                        fetchData={handleTableChange}
                        columns={tableColumns}
                        watchStates={[filters]}
                        rowKey={(record) => record.IDlot}
                        exportData={exportData}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default TransactionHistory;
