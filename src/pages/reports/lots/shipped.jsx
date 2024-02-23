

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as dayjs from 'dayjs';
import UserPermissions from "@/policy/ability";
import { disableDate } from "@/hooks/date-picker";
import { getLotShippedReport, exportLotShipped } from "@/api/reports/lots";
import { Avatar, Form, Input, Select, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";
import { useValidationErrors } from "@/hooks/validation-errors";
import CustomerSelect from "@/shared/form-fields/customer-select"
import { IconFileText, IconList, IconSearch, IconSettings } from "@tabler/icons-react";

const LotsShipped = () => {
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
    }, []);

    const tableColumns = [
        {
            title: "Ship. date",
            key: "dateShip",
            type: 'datetimetz',
            sorter: false,
            filterable: false
        },
        {
            title: "Lot",
            key: "idLot",
            sorter: false,
            filterable: false
        },
        {
            title: "Eur1",
            key: "eur1",
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
            key: "dimensions",
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
            title: "Destination",
            key: "bpdDesc",
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
                        <Button title={record.note} className={record.note == '' ? 'btn-dark' : 'btn-info'} icon={<IconFileText />}></Button>
                        <Link title="Go to stock tracking" href={`/reports/lots/tracking?idLot=${encodeURIComponent(record['idLot'])}`}>
                            <Button className="btn-info" icon={<IconList />}></Button>
                        </Link>
                        {record["numComp"] ?
                            <Link title="Go to production order" href={`/order/production/${record['idLot']}`}>
                                <Button className="btn-info" icon={<IconSettings />}></Button>
                            </Link>
                            :
                            <Button title="Production order not present" className="btn-dark" icon={<IconSettings />}/>
                        }
                    </Space.Compact>
                </>
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
        if (form.getFieldValue('customer')) {
            filters['idBP'] = form.getFieldValue('customer');
        }
        setLoaded(true);
        setFilters(filters);
    }

    const handleTableChange = async (params) => {
        if (!loaded) {
            return [];
        }
        setLoading(true);
        validationErrorsBag.clear();
        const { data, error, validationErrors } = await getLotShippedReport({
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
        const { data, error } = await exportLotShipped({
            ...params,
            ...filters
        });
        return [data, `CSM_lot_ship_bp_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    return (
        <div className="page">
            <PageActions title="Lot Shipped to Business Partner">
                <Space>
                    <Form layout="inline" form={form}>
                        <Form.Item name="dates" {...validationErrorsBag.getInputErrors('dates')}>
                            <RangePicker
                                format={'YYYY-MM-DD'}
                                allowClear
                            />
                        </Form.Item>
                        <Form.Item name="customer" {...validationErrorsBag.getInputErrors('idBP')}>
                            <CustomerSelect />
                        </Form.Item>
                        <Button icon={<IconSearch/>} loading={loading} type="primary" onClick={updateTransactions}>
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
                        rowKey={(record) => record.idLot}
                        exportData={exportData}
                    />
                </Col>
            </Row>
        </div>
    );
};

export default LotsShipped;
