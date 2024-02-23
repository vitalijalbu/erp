import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getItemById, getStockLimits, getStockLimitsHistory, addStockLimit } from "@/api/items";
import {
    Row,
    Col,
    Button,
    Form,
    message,
    Tag,
    Card,
    Select,
    Input
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
    getAllWarehouses,
} from "@/api/warehouses";
import Datatable from "@/shared/datatable/datatable";
import Toolbar from "@/shared/items/toolbar";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;

    const validationErrorsBag = useValidationErrors();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState(null);
    const [warehouses, setWarehouses] = useState([]);
    const [stockLimits, setStockLimits] = useState([]);
    const [stockLimitsHistory, setStockLimitsHistory] = useState([]);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [reload, setReload] = useState(0);


    

    const fetchStockLimits = async (params) => {
        if (router.isReady) {
            const result = await getStockLimits(id);
            return result;
        }
        return [];
    };

    const fetchStockLimitsHistory = async (params) => {
        if (router.isReady) {
            const result = await getStockLimitsHistory(id);
            return result;
        }
        return [];
    };

    useEffect(() => {
        (async () => {
            const warehouses = await getAllWarehouses();
            setWarehouses(warehouses.data.map((w) => ({
                label: w.country.desc + ' - ' + w.desc,
                value: w.IDwarehouse
            })));
        })();
    }, []);

    useEffect(() => {
        if (router.isReady) {
            setLoading(true);
            (async () => {
                const { data, error } = await getItemById(id)
                if (!error) {
                    setItem(data);
                }
                else {
                    message.error("Error during item loading")
                }
                setLoading(false);
            })();
        }
    }, [router.isReady, id]);

    const addLimit = async () => {
        setLoading(true);
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await addStockLimit(
            id,
            form.getFieldsValue()
        );
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
            setIsFormChanged(false);
        }
        else {
            message.success("Stock limit saved successfully");
            form.resetFields();
            setReload(reload + 1);
            setIsFormChanged(false);
        }
        setLoading(false);
    }

    const tableColumns = [
        {
            title: "Qty min",
            key: "qty_min",
            filterable: false,
            sorter: false,
            type: 'number'
        },
        {
            title: "Qty_max",
            key: "qty_max",
            filterable: false,
            sorter: false,
            type: 'number'
        },
        {
            title: "Inserted Date",
            key: "date_ins",
            filterable: false,
            sorter: false,
            type: 'datetz'
        },
        {
            title: "Whs",
            key: "warehouse.desc",
            filterable: false,
            sorter: false,
        },
        {
            title: "Username",
            key: "username",
            filterable: false,
            sorter: false,
            render: ({ username }) => <Tag>{username}</Tag>,
        },
    ];

    return (
        <div className="page">
            {item &&
                <>
                    <PageActions
                        backUrl="/items"
                        loading={loading}
                        title={<>Stock Limits for Item - <mark>{item?.item} - {item?.item_desc}</mark></>}
                        extra={[
                            <div className="d-flex card-action-container">
                                <Button key={0} htmlType="submit" disabled={!isFormChanged} type="primary" onClick={addLimit} loading={loading}>
                                   Save
                                </Button>
                            </div>
                        ]}
                    ><Toolbar/></PageActions>

                    <div className="page-content">
                        <Row>
                            <Col span={24} className="mb-3">
                                <Card
                                    loading={loading}
                                    title="Insert new stock item limits"
                                    className="mb-3">
                                    <Form
                                        layout="vertical"
                                        form={form}
                                        onFinish={addLimit}
                                        onValuesChange={() => setIsFormChanged(true)}
                                    >
                                        <Form.Item
                                            label="Warehouse/Location"
                                            name="IDwarehouse"
                                            {...validationErrorsBag.getInputErrors('IDwarehouse')}
                                        >
                                            <Select options={warehouses} />
                                        </Form.Item>
                                        <Row gutter={16}>
                                            <Col span="12">
                                            <Form.Item
                                            label={`Min Stock (${item.um})`}
                                            name="qty_min"
                                            {...validationErrorsBag.getInputErrors('qty_min')}
                                        >
                                            <Input allowClear />
                                        </Form.Item>
                                            </Col> 
                                             <Col span="12">
                                             <Form.Item
                                            label={`Max Stock (${item.um})`}
                                            name="qty_max"
                                            {...validationErrorsBag.getInputErrors('qty_max')}
                                        >
                                            <Input allowClear />
                                        </Form.Item>
                                            </Col>
                                        </Row>
                                      
                                     
                                    </Form>
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                            <Card
                                    loading={loading}
                                    title="Current stock limits"
                                    className="mb-3">
                                <Datatable
                                    fetchData={fetchStockLimits}
                                    columns={tableColumns}
                                    rowKey={(record) => record.id}
                                    pagination={false}
                                    watchStates={[reload]}
        
                                />
                                </Card>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                            <Card
                                    loading={loading}
                                    title="History stock limits"
                                    className="mb-3">
                                <Datatable
                                    fetchData={fetchStockLimitsHistory}
                                    columns={tableColumns}
                                    rowKey={(record) => record.id}
                                    pagination={false}
                                    watchStates={[reload]}
                            
                                />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                </>
            }
        </div>
    );
};

export default Index;
