

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import * as dayjs from 'dayjs';
import UserPermissions from "@/policy/ability";
import { getLotReceivedReport, exportLotReceived } from "@/api/reports/lots";
import { Form, Space, Row, Col, Button, DatePicker, message } from "antd";
import PageActions from "@/shared/components/page-actions";
const { RangePicker } = DatePicker;
import { useRecoilState } from 'recoil';
import { filterState } from "store/reports";
import Datatable from "@/shared/datatable/datatable";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectSupplier from "@/shared/form-fields/select-supplier"
import { IconFileText, IconList, IconSettings } from "@tabler/icons-react";

const LotsReceived = () => {
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
            title: "Rec. date",
            key: "dateTran",
            type: 'datetimetz',
            sorter: false,
            filterable: false
        },
        {
            title: "Lot",
            key: "IDlot",
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
            title: "W",
            key: "LA",
            sorter: false,
            filterable: false
        },
        {
            title: "L",
            key: "LU",
            sorter: false,
            filterable: false
        },
        {
            title: "P",
            key: "PZ",
            sorter: false,
            filterable: false
        },
        {
            title: "E",
            key: "DE",
            sorter: false,
            filterable: false
        },
        {
            title: "I",
            key: "DI",
            sorter: false,
            filterable: false
        },
        {
            title: "Order ref. on lot",
            key: "ordRif",
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
                        <Link title="Go to stock tracking" href={`/reports/lots/tracking?idLot=${encodeURIComponent(record['IDlot'])}`}>
                            <Button className="btn-info" icon={<IconList />}></Button>
                        </Link>
                        {record["numComp"] ?
                            <Link title="Go to production order" href={`/order/production/${record['IDlot']}`}>
                                <Button className="btn-info" icon={<IconSettings />}></Button>
                            </Link>
                            :
                            <Button title="Production order not present" className="btn-dark" icon={<IconSettings />}></Button>
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
        if (form.getFieldValue('supplier')) {
            filters['idBP'] = form.getFieldValue('supplier');
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
        const { data, error, validationErrors } = await getLotReceivedReport({
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
        const { data, error } = await exportLotReceived({
            ...params,
            ...filters
        });
        return [data, `CSM_lot_received_bp_${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    return (
        <div className="page">
            <PageActions title="Lot Received from Supplier">
                <Space>
                    <Form layout="inline" form={form}>
                        <Form.Item name="dates" {...validationErrorsBag.getInputErrors('dates')}>
                            <RangePicker
                                format={'YYYY-MM-DD'}
                            />
                        </Form.Item>
                        <Form.Item name="supplier" {...validationErrorsBag.getInputErrors('idBP')}>
                            <SelectSupplier />
                        </Form.Item>
                        <Button loading={loading} type="primary" onClick={updateTransactions}>
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

export default LotsReceived;
