import React, { useState } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { numberFormatter } from "@/hooks/formatter";
import { getLayerDetails, getLayerDetailsExport } from "@/api/reports/wac";
import { Row, Col, Typography, Table, Alert, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
const { Text, Title } = Typography;

const YearLayerReport = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("wac.management")) {
        return false;
    }

    const router = useRouter();
    const { year } = router.query;

    const [errors, setErrors] = useState([]);

    //Handle API Fetch Data
    const handleTableChange = async (params) => {
        const {data, error} = await getLayerDetails(params, year);
        if(error) {
            message.error("Error during data fetching")
            setErrors([]);
            return [];
        }
        else {
            setErrors(data.errors);
            return data;
        }
        
    };

    //Handle Export
    const exportData = async (params) => {
        const result = await getLayerDetailsExport(params, year);
        return [result.data, `reports-layer-${year}.xlsx`];
    };


    const tableColumns = [
        {
            title: "Year layer",
            key: "year_layer",
            dataIndex: "year_layer",
            sorter: false,
            filterable: false
        },
        {
            title: "Item",
            description: "Item code",
            key: "item",
            sorter: false,
            render: ({ item }) => <Text copyable>{item}</Text>,
        },
        {
            title: "Description",
            description: "Item description",
            key: "item_desc",
            dataIndex: "item_desc",
            sorter: false,
            filterable: false
        },
        {
            title: "Item Conf.",
            description: "Item Configured",
            key: "conf_item",
            dataIndex: "conf_item",
            type: 'bool',
            sorter: false,
            filterable: false
        },
        {
            title: "Qty start year",
            description: "Stock quantity at the beginning of the year",
            key: "stock_qty_start_year",
            align: "right",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Qty end year",
            description: "Stock quantity at the end of the year",
            align: "right",
            key: "stock_qty_end_year",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Purch. qty",
            description: "Purchased quantity during the year",
            align: "right",
            key: "purchasedQty_on_the_year",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Purch. value",
            description: "Purchased value during the year",
            align: "right",
            key: "purchasedItemValue_on_the_year",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "Value start year",
            description: "Stock value at the beginning of the year",
            align: "right",
            key: "stock_value_start_year",
            type: 'number',
            sorter: false,
            filterable: false
        },
        {
            title: "Value end year",
            description: "Stock value at the end of the year",
            align: "right",
            key: "stock_value_end_year",
            dataIndex: "stock_value_end_year",
            type: 'number',
            sorter: false,
            filterable: false
        }
    ];


    const tableErrors = [
        {
            title: "ID Lot",
            key: "IDlot",
            dataIndex: "IDlot",
        },
        {
            title: "Item",
            key: "item",
            dataIndex: "item",
            copyable: true
        },
        {
            title: "Qty",
            align: "right",
            key: "qty",
            type: 'qty',
            after: (record) => record.um
        },
        {
            title: "Unit Value",
            key: "UnitValue",
            dataIndex: "UnitValue",
        }
    ];


    return (
        <div className="page">
            <PageActions
                backUrl="/reports/wac/layers"
                title={`WAC layer detail - ${year}`} />
            <div className="page-content">
                {errors && errors.length > 0 ?
                    (<>
                        <Title level={5}>Errors on calculated layer:</Title>
                        <Row className="mb-3">
                            <Col span={24}>
                                <Table
                                    columns={tableErrors}
                                    dataSource={errors}
                                    pagination={false}
                                />
                            </Col>
                        </Row>
                     </>) 
                     : (<Alert className="mb-3" message="No errors found, check if the layer of the previous year is present ..."></Alert>)
                }

                <Row gutter={16}>
                    <Col span={24}>
                        <Datatable
                            columns={tableColumns}
                            fetchData={handleTableChange}
                            exportData={exportData}
                            rowKey={(record) => record.id}
                            watchStates={[year]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default YearLayerReport;
