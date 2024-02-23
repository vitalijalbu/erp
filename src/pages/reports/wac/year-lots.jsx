import React, { useState, useEffect, useCallback } from "react";
import { calcYearToDateDetails, getWacYtdLotsDetailExport } from "@/api/reports/wac";
import { dateTZFormatter, dateTimeTZFormatter, numberFormatter } from "@/hooks/formatter";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import dayjs from "dayjs";
import { Form, Input, Alert, Row, Col, Button, Tag, Typography, DatePicker, message } from "antd";
import Datatable from "@/shared/datatable/datatable";

const { Text } = Typography;
const { TextArea } = Input;

const YearLots = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("wac.management")) {
    return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [date, setDate] = useState({ value: null });
    const [loaded, setLoaded] = useState(false);
    const [notChecked, setNotChecked] = useState([]);
    const [found, setFound] = useState(0);

    // Datatable handle change
    const handleTableChange = async (params) => {
        if (date.value) {
            const filters = {
                ...params,
                date: dayjs(date.value).format("YYYY-MM-DD"),
            };
            setLoading(true);
            const {data, error} = await calcYearToDateDetails(filters);

            if(error) {
                message.error(error?.response?.data?.message || "Error during data fetching");
                setLoaded(false);
                setNotChecked([]);
                setFound(0);
            }
            else {
                setLoaded(true);
                setNotChecked(data.not_checked);
                setFound(data.recordsFiltered);
            }

            setLoading(false);
            return data;
        }
        return [];
    };

    const exportData = async (params) => {
        setLoading(true);
        const filters = {
            ...params,
            date: dayjs(date.value).format("YYYY-MM-DD"),
        };
        const result = await getWacYtdLotsDetailExport(filters);
        setLoading(false);
        return [result.data, `CSM_wac_calc_year_to_date_with_lot_detail${dayjs().format('YYYYMMDDHHmm')}.xlsx`];
    };

    const tableColumns = [
        {
            title: "Whs",
            description: "Warehouse",
            key: "Whs",
            sorter: false,
            filterable: false,
        },
        {
            title: "IdLot",
            description: "Lot ID",
            key: "IDlot",
            sorter: false,
            filterable: false,
            copyable: true
        },
        {
            title: "Lot date",
            key: "date_lot",
            type: "datetime",
            sorter: false,
            filterable: false,
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            filterable: false,
            copyable: true
        },
        {
            title: "Desc.",
            description: "Item description",
            key: "item_desc",
            sorter: false,
            filterable: false,
        },
        {
            title: "Conf. item",
            description: "Configured Item",
            key: "conf_item",
            type: "bool",
            sorter: false,
            filterable: false,
        },
        {
            title: "Qty",
            description: "Stock quantity at the searched date",
            align: "right",
            key: "qty",
            type: 'qty',
            after: (record) => record.um,
            filterable: false,
        },
        {
            title: "WAC y.",
            description: "WAC year layer",
            key: "year_layer",
            sorter: false,
            filterable: false,
        },
        {
            title: "WAC notes",
            key: "notes",
            sorter: false,
            filterable: false,
        },
        {
            title: "WAC cost",
            description: "WAC Weighted average cost",
            key: "WAC_cost",
            type: "number",
            sorter: false,
            filterable: false,
        },
        {
            title: "WAC S. val",
            description: "WAC stock valorized with weighted average cost",
            key: "stock_valorized_wac",
            filterable: false,
            sorter: false
        },
        {
            title: "Searched date",
            key: "now",
            type: "datetz",
            sorter: false,
            filterable: false,
            render: () => dateTZFormatter(date.value.format('YYYY-MM-DD HH:mm'))
        },
        {
            title: "Extraction date",
            key: "now",
            type: "datetz",
            sorter: false,
            filterable: false,
            render: () => dateTZFormatter(dayjs().format('YYYY-MM-DD HH:mm'))
        },

    ];

    return (
        <div className="page">
            <PageActions
                title="Stock situation on date with lot detail and WAC valorization:">
                <Alert
                        message="Warning"
                        showIcon
                        description="This report extracts the stock situation at the searched date with the lot detail and includes the WAC valorization. In order to have a correct WAC valorization, the layers of the year before the searched date must be calculated and in a definitive state; otherwise, the extracted data will be incorrect."
                    />
            </PageActions>
            <div className="page-subhead_root">
                <Form
                    layout="inline"
                    form={form}
                    onFinish={(values) => {setDate({value: values["date"]})}}
                >
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker allowClear />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading}>
                            Apply filters
                        </Button>
                    </Form.Item>
                </Form>
            </div>
      
            <div className="page-content">
                {
                    loaded && found == 0 && (
                        <Alert 
                            className="mb-3 mt-3"
                            type="error"
                            message="No data found, check if the layer of the previous year is present and set to definitive ... "
                        >
                            
                        </Alert>
                    )
                }
                <Row>
                    <Col span={24}>
                        <div style={{display: loaded ? 'block' : 'none' }}>
                            <Datatable
                                style={{ whiteSpace: "pre"}}
                                fetchData={handleTableChange}
                                watchStates={[date]}
                                columns={tableColumns}
                                rowKey={(record) => record.IDlot}
                                exportData={exportData}
                            />
                        </div>
                    </Col>
                </Row>
                {
                    loaded && notChecked?.count > 0 && (
                        <Alert 
                            className="mt-3"
                            type="warning"
                            message={`The followings ${notChecked.count} lots are with unchecked value`}
                            description={notChecked.lots.map((lot) => <div>{lot}</div>)}
                        >
                            
                        </Alert>
                    )
                }
            </div>
        </div>
    );
};

export default YearLots;
