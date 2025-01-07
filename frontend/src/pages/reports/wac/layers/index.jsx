import React, { useState, useEffect } from "react";
import { 
    getAllLayers,
    getAvailableYears ,
    addOrRecreateLayer,
    setLayerDefinitive
} from "@/api/reports/wac";
import UserPermissions from "@/policy/ability";
import { numberFormatter } from "@/hooks/formatter";
import PageActions from "@/shared/components/page-actions";
import dayjs from "dayjs";
import { Form, Select, Input, Alert, Space, Row, Col, Button, message, Tag, Typography, Tooltip, Modal } from "antd";
import { IconAward, IconEye } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { DatatableController } from "@/shared/datatable/datatable";
import Link from "next/link";
const { Text } = Typography;
const { TextArea } = Input;
import { useValidationErrors } from "@/hooks/validation-errors";
const { confirm } = Modal;

const Layers = () => {

    //Set page permissions
    if (!UserPermissions.authorizePage("wac.management")) {
        return false;
    }

    const [form] = Form.useForm();

    const [loading, setLoading] = useState(false);
    const [years, setYears] = useState([]);
    const validationErrorsBag = useValidationErrors();
    const controller = new DatatableController();

    useEffect(() => {
        (async () => {
            const {data, error} = await getAvailableYears();
            if(error) {
                message.error(error?.response?.data?.message || 'Error during available years loading');
            }
            setYears(data);
        })();
    }, [])

    const handleTableChange = async (params) => {
        const result = await getAllLayers(params);
        return result;
    };

    const addLayer = async () => {
        setLoading(true);
        const year = form.getFieldValue('year');
        validationErrorsBag.clear();
        const {status, error, validationErrors} = await addOrRecreateLayer(year);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during year layer add/recreate");
        }
        else {
            message.success("Year layer addedd/recreated succesfully");
            form.setFieldValue('year', null);
            
        }
        controller.refresh();
        setLoading(false);
    }

    const setDefinitive = async (record) => {
        confirm({
            title: 'Attention',
            content: 'Do you want to set this layer as definitive?',
            transitionName: "ant-modal-slide-up",
            async onOk() {
                setLoading(true);
                const { status, error } = await setLayerDefinitive(record.IDlayer);
                if (!error) {
                    message.success("operation completed successfully");
                    controller.refresh();
                }
                else {
                    message.error(error?.response?.data?.message || "Error during operation");
                }
                setLoading(false);
            },
            onCancel() {

            },
        });
    }

    const tableColumns = [
        {
            title: "Year layer",
            key: "year_layer",
            sorter: false,
            filterable: false,
        },
        {
            title: "Username",
            key: "username",
            sorter: false,
            filterable: false,
            render: ({ username }) => <Tag>{username}</Tag>
        },
        {
            title: "Calc. date",
            key: "date_calc",
            type: 'datetimetz',
            sorter: false,
            filterable: false,
        },
        {
            title: "Definitive date",
            key: "date_definitive",
            type: 'datetimetz',
            sorter: false,
            filterable: false,
        },
        {
            title: "Status",
            key: "definitive",
            sorter: false,
            filterable: false,
            render: (value, record) => {
                if(record.definitive == 0) {
                    if(record.CountNotCheckedValue == 0) {
                        return (<Tag color="red">
                            Not definitive, regenerable.
                        </Tag>);
                    }
                    return (<Tag color="red">
                            {`Not definitive, regenerable. Before make it definitive is mandatory check  ${record.CountNotCheckedValue} lots value.`}
                        </Tag>);
                }
                else {
                    return (<Tag color="blue">
                        Definitive, no actions permitted.
                    </Tag>);
                }
                
            },
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) => (
                <Space>
                    {
                        record.definitive == 0 && (
                            <Tooltip title="Set definitive">
                                <Button 
                                    onClick={() => setDefinitive(record)}
                                    icon={<IconAward></IconAward>}
                                    danger 
                                    disabled={record.CountNotCheckedValue != 0}>
                                </Button>
                            </Tooltip>
                        )
                    }
                        <Link href={`/reports/wac/layers/${record.year_layer}`}>
                            <Button icon={<IconEye/>}>View</Button>
                        </Link>
                </Space>
            ),
        },
    ];
  
    return (
        <div className="page">
            <PageActions title="WAC year layers">
            </PageActions>
            <Alert
            message="Info"
            showIcon
            description={
                <ul>
                    <li>The creation of an year layer must be done when the financial year is completed (Example: you cannot create layer 2030 on 1 December 2030)</li>
                    <li>Before to set an year layer as "definitive" is mandatory to check that all lots has been correctly evaluated (purchase cost).</li>
                    <li>In order to create a new year layer is mandatory to set as "definitive" the previous layer.</li>
                    <li>When an year layer will be set as "definitive" will be unmanageble (no changes will be permitted)</li>
                </ul>
            }
            ></Alert>
            <div className="page-content mt-3">
                <Row>
                    <Form form={form}>
                        <Space style={{display: 'flex', alignItems: 'flex-start'}}>
                            <Form.Item name="year" {...validationErrorsBag.getInputErrors('year')}>
                                <Select 
                                    placeholder="Select a year"
                                    options={years.map((year) => (
                                        {
                                            label: year, 
                                            value: year
                                        }
                                    ))}
                                >
                                </Select>
                            </Form.Item>
                            <Button 
                                type="primary" 
                                disabled={years.length == 0}
                                onClick={() => addLayer()}
                            >Add new year layer o recreate</Button>
                        </Space>
                    </Form>
                </Row>
                <Row>
                    <Col span={24}>
                        <Datatable 
                            controller={controller}
                            columns={tableColumns} 
                            fetchData={handleTableChange} 
                            rowKey={(record) => JSON.stringify(record)}
                            pagination={false}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Layers;
