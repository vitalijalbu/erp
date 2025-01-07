import React, { useState, useEffect, useCallback } from "react";
import { calcSimulation, calcSimulationExport } from "@/api/reports/wac";
import UserPermissions from "@/policy/ability";
import { useValidationErrors } from "@/hooks/validation-errors";
import { dateTimeTZFormatter, numberFormatter } from "@/hooks/formatter";
import * as dayjs from "dayjs";
import {
    Form,
    Input,
    Alert,
    Row,
    Col,
    Tooltip,
    Table,
    Button,
    message,
    Tag,
    Typography,
    DatePicker,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { useExport } from "@/hooks/download";

const { Text, Title } = Typography;

const CalcSimulation = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("wac.management")) {
        return false;
    }

    const [loading, setLoading] = useState(false);
    const [data, setData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [form] = Form.useForm();
    const [loaded, setLoaded] = useState(false);
    const [exportFilters, setExportFilters] = useState(null);
    const validationErrorsBag = useValidationErrors();

    const onSubmit = async (values) => {
        setLoading(true);
        const filters = {
            ...values,
            date: values?.date?.format("YYYY-MM-DD"),
        };
        validationErrorsBag.clear();
        const { data, error, validationErrors } = await calcSimulation(filters);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            else {
                message.error(error?.response?.data?.message || "Error during calc simulation data loading");
            }
            setData(null);
            setTransactions([]);
            setLoaded(false);
            setExportFilters(null);
        }
        else {
            setData(data.layer);
            setTransactions(data.transactions);
            setLoaded(true);
            setExportFilters(filters);
        }

        setLoading(false);
    };

    const exportData = async () => {
        setLoading(true);
        const { data, error } = await calcSimulationExport(exportFilters);
        if (error) {
            message.error("Error during calc simulation download");
        }
        else {
            useExport(data, 'CSM_wac_calc_simulation_' + dayjs().format('YYYYMMDDHHmm') + '.xlsx');
        }
        setLoading(false);
    }

    const columnsLayer = [
        {
            title: (
                <Tooltip title="Year">
                    Year
                </Tooltip>
            ),
            key: "year_layer",
            render: ({ year_layer }) => year_layer,
        },
        {
            title: (
                <Tooltip title="Item">
                    Item
                </Tooltip>
            ),
            key: "item",
            render: ({ item }) => item,
        },
        {
            title: (
                <Tooltip title="Configured item">
                    Conf. item
                </Tooltip>
            ),
            key: "conf_item",
            render: ({ conf_item }) => (
                <Tag color={conf_item === 1 ? "green" : null}>{conf_item === 1 ? "Yes" : "No"}</Tag>
            ),
        },
        {
            title: (
                <Tooltip title="Stock quantity at the beginning of the year">
                    Qty beg. year
                </Tooltip>
            ),
            key: "stock_qty_start_year",
            render: ({ stock_qty_start_year }) => <Text>{numberFormatter(stock_qty_start_year)}</Text>,
        },
        {
            title: (
                <Tooltip title="Stock quantity at the end of the year">
                    Qty end year
                </Tooltip>
            ),
            key: "stock_qty_end_year",
            render: ({ stock_qty_end_year }) => <Text>{numberFormatter(stock_qty_end_year)}</Text>,
        },
        {
            title: (
                <Tooltip title="Purchased quantity during the year">
                    Purch. qty
                </Tooltip>
            ),
            key: "purchasedQty_on_the_year",
            render: ({ purchasedQty_on_the_year }) => <Text>{numberFormatter(purchasedQty_on_the_year)}</Text>,
        },
        {
            title: (
                <Tooltip title="Purchased value during the year">
                    Purch. value
                </Tooltip>
            ),
            key: "purchasedItemValue_on_the_year",
            render: ({ purchasedItemValue_on_the_year }) => (
                <Text>{numberFormatter(purchasedItemValue_on_the_year)}</Text>
            ),
        },
        {
            title: (
                <Tooltip title="Stock value at the beginning of the year">
                    Value beg. year
                </Tooltip>
            ),
            key: "stock_value_start_year",
            render: ({ stock_value_start_year }) => <Text>{numberFormatter(stock_value_start_year)}</Text>,
        },
        {
            title: (
                <Tooltip title="Stock value at the end of the year">
                    Value end year
                </Tooltip>
            ),
            key: "stock_value_end_year",
            render: ({ stock_value_end_year }) => <Text>{numberFormatter(stock_value_end_year)}</Text>,
        },
        {
            title: (
                <Tooltip title="Weighted Average Cost">
                    WAC
                </Tooltip>
            ),
            key: "wac_avg_cost",
            render: ({ wac_avg_cost }) => <Text>{numberFormatter(wac_avg_cost)}</Text>,
        },
    ];
    const columnsTransaction = [
        {
            title: "Lot",
            key: "IDlot",
            render: ({ IDlot }) => <Text>{IDlot}</Text>,
        },
        {
            title: "Conf. item",
            key: "conf_item",
            render: ({ conf_item }) => (
                <Tag color={conf_item === "1" ? "green" : null}>{conf_item === "1" ? "Yes" : "No"}</Tag>
            ),
        },
        {
            title: "Purchased qty",
            align: "right",
            key: "PurchasedQty",
            render: (record) => <Text>{numberFormatter(record.PurchasedQty)} {record.um}</Text>,
        },
        {
            title: "Purchase Value",
            key: "PurchasedItemValue",
            render: ({ PurchasedItemValue }) => <Text>{numberFormatter(PurchasedItemValue)}</Text>,
        },
        {
            title: "Unit purchase cost",
            key: "PurchasedItemValue",
            render: ({ UnitValue }) => <Text>{numberFormatter(UnitValue)}</Text>,
        },
        {
            title: "Transaction date",
            key: "date_tran",
            render: ({ date_tran }) => <Text>{dateTimeTZFormatter(date_tran)}</Text>,
        },
        {
            title: "Year",
            key: "year",
            render: ({ year }) => year,
        },
        {
            title: "Stock at the end of year",
            key: "stock_end_year",
            render: ({ stock_end_year }) => <Text>{numberFormatter(stock_end_year)}</Text>,
        },
        {
            title: "Notes",
            key: "Note",
            dataIndex: "Note",
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Wac calc simulation"
                extra={[
                    loaded && transactions?.length > 0 && 
                        <Button loading={loading} onClick={() => exportData()}>Export</Button>
                ]}
            >
                <div className="page-subhead_root">
                    <Form layout="inline" form={form} onFinish={onSubmit}>
                        <Form.Item name="item" label="Item Code" {...validationErrorsBag.getInputErrors('item')}>
                            <Input allowClear />
                        </Form.Item>
                        <Form.Item name="date" label="Date" {...validationErrorsBag.getInputErrors('date')}>
                            <DatePicker allowClear format="YYYY-MM-DD" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} title="Extract data used to generate the WAC calculation">
                                Generate
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </PageActions>

            {loaded && (<div className="page-content">
                <Row className="mb-3">
                    <Title level={5}>Selected layer</Title>
                    <Col span={24}>
                        {data ? (
                            <Table
                                columns={columnsLayer}
                                loading={loading}
                                dataSource={data ? [data] : []}
                                rowKey="IDlot"
                                pagination={false}
                            />
                        ) : (
                            <Alert
                                message="No data found, check if the layer of the previous year is present ..."
                                type="error"
                            />
                        )}
                    </Col>
                </Row>
                <Row>
                    <Title
                        level={5}
                    >{`Transactions (${transactions.length})`}
                    </Title>
                    <Col span={24}>
                        {transactions.length > 0 ? (
                            <Table
                                columns={columnsTransaction}
                                loading={loading}
                                dataSource={transactions}
                                rowKey="IDlot"
                                pagination={{
                                    hideOnSinglePage: true,
                                    pageSize: 100,
                                    position: ["bottomCenter"],
                                }}
                            />
                        ) : (
                            <Alert message="No errors found, check if the layer of the previous year is present ..." />
                        )}
                    </Col>
                </Row>
            </div>)}
        </div>
    );
};

export default CalcSimulation;
