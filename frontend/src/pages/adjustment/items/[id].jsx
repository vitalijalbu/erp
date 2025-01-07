"use client";
import React, { useState, useCallback, useEffect } from "react";
import UserPermissions from "@/policy/ability";
import { useRouter } from "next/router";
import { getLotByItemId } from "@/api/lots";
import { getItemById, loadNewLot } from "@/api/items";
import { getAdjustmentTypes } from "@/api/globals/index";
import { Form, Select, Card, Row, Col, Modal, Button, Typography, Divider, Switch, message, Input } from "antd";
const { TextArea } = Input;
const { Text } = Typography;
const { confirm } = Modal;
import { useValidationErrors } from "@/hooks/validation-errors";
import PageActions from "@/shared/components/page-actions";
import DynamicDimensions from "@/shared/form-fields/dynamic-dimensions";
import WarehouseSelect from "@/shared/form-fields/warehouse-select";
import { IconApps, IconTrashX } from "@tabler/icons-react";



const View = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("warehouse_adjustments.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(false);
    const [data, setData] = useState({});

    const validationErrorsBag = useValidationErrors();
    const [popup, setPopup] = useState(false);

    const togglePopup = () => {
        setPopup(!popup);
    };


    useEffect(() => {
        if (router.isReady) {
            setLoading(true);
            (async () => {
                const { data, error } = await getItemById(id)
                if (!error) {
                    setData(data);
                }
                else {
                    message.error("Error during item loading")
                }
                setLoading(false);
            })();
        }
    }, [router.isReady]);
    // Action Issue Materials
    const handleSubmit = async (values) => {
        setLoading(true);
        const { status, error, validationErrors } = await loadNewLot(id, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);

            }
            message.error("Error during saving operation");
            setLoading(false);
        } else {
            message.success("Success saved");
            router.push("/adjustment/items");
        }
    };
    
    return (
        <div className="page">
            <PageActions
                backUrl="/adjustment/items"
                title={<>Add new lot for item <mark>{data?.item} - {data?.item_desc}</mark></>} />
            <div className="page-content">
                <Row>
                    <Col span={24}>
                        <Card title="Compile form">
                            <Text className="mb-3" type="secondary">
                                Load a new lot with the below dimensions
                            </Text>

                            <Form layout="vertical" onFinish={handleSubmit} form={form} name="update-lot">
                                <Row gutter={16}>
                                    <Col span="12">
                                        <SelectReason />
                                        <Row gutter={16}>
                                            <Col span="8">
                                                <Form.Item
                                                    label="Eur1"
                                                    name="eur1"
                                                    initialValue={false}
                                                    {...validationErrorsBag.getInputErrors('eur1')}
                                                >
                                                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                                </Form.Item>
                                            </Col>
                                            <Col span="8">
                                                <Form.Item
                                                    label="Merged Lot"
                                                    name="mergedLot"
                                                    initialValue={false}
                                                    {...validationErrorsBag.getInputErrors('mergedLot')}
                                                >
                                                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                                </Form.Item>
                                            </Col>
                                            <Col span="8">
                                                <Form.Item
                                                    label="Configurated item"
                                                    name="confItem"
                                                    initialValue={false}
                                                    {...validationErrorsBag.getInputErrors('confItem')}
                                                >
                                                    <Switch checkedChildren="Yes" unCheckedChildren="No" />
                                                </Form.Item>
                                            </Col>
                                        </Row>
                                        <Form.Item
                                            label="Lot text"
                                            name="lotText"
                                            {...validationErrorsBag.getInputErrors('lotText')}
                                        >
                                            <TextArea rows="6" allowClear />
                                        </Form.Item>
                                        <SelectDadLot id={id} />
                                    </Col>
                                    <Col span="12">
                                        <DynamicDimensions um={data?.um} validationErrors={validationErrorsBag}/>
                                        <WarehouseSelect onChange={form.setFieldsValue} validationErrors={validationErrorsBag}/>
                                    </Col>
                                </Row>

                                <Divider />
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" loading={loading} icon={<IconApps />}>
                                        Load new Lot
                                    </Button>
                                </Form.Item>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default View;


//=============================================================================
// Select component
//=============================================================================

const SelectReason = () => {
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        getAdjustmentTypes()
            .then(({ data }) => {
                setReasons(
                    data?.map((item) => ({
                        label: item?.desc,
                        value: item?.IDadjtype,
                    })) || []
                );
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    return (
        <Form.Item name="idAdjustmentType" label="Select reason" rules={[{ required: true }]}>
            <Select options={reasons} defaultValue={reasons[0]} allowClear />
        </Form.Item>
    );
};


//=============================================================================
// Select component Dad Lot
//=============================================================================

const SelectDadLot = ({ id }) => {
    const [lots, setLots] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (id) {
            (async () => {
                setLoading(true);
                const {data, error} = await getLotByItemId(id);
                setLots(
                    data.data.map((item) => ({
                        label: item?.IDlot,
                        value: item?.IDlot,
                    })) || []
                );
                if(error) {
                    message.error(error?.response?.data?.message || "Error during lot data fetching");
                }
                setLoading(false);
            })();
        }
    }, [id]);

    return (
        <Form.Item name="dadLot" label="Lot origin previously in stock (not mandatory):">
            <Select
                showSearch
                filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={lots}
                loading={loading}
                allowClear />
        </Form.Item>
    );
};