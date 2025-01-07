"use client";
import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getItemById } from "@/api/items";
import { getLotDimensions, deleteLotFromStock, eraseLotStock } from "@/api/lots";
import { getAdjustmentTypes } from "@/api/globals/index";
import { Form, Select, Card, Row, Col, Modal, Button, Typography, Divider, InputNumber, message } from "antd";
const { Text } = Typography;
const { confirm } = Modal;
import { useValidationErrors } from "@/hooks/validation-errors";
import PageActions from "@/shared/components/page-actions";
import DynamicDimensions from "@/shared/form-fields/dynamic-dimensions";
import { IconEraser, IconTrashX } from "@tabler/icons-react";

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

    //Get lot info & dimensions
    const getDataCallback = useCallback(() => {
        (async () => {
            setLoading(true);
            const {data, error} = await getLotDimensions(id);

            if(error) {
                message.error(error?.response?.data?.message || "Error during stock data loading");
            }

            setData(data);
            const formValues = {};
            if (data && data.lot && data.lot.dimensions && data.lot.dimensions.length > 0) {
                data.lot.dimensions.forEach((dimension) => {
                    formValues[dimension.IDcar.toLowerCase()] = dimension.val;
                });
            }
            form.setFieldsValue(formValues);
            setLoading(false);
        })();
    }, [id]);

    // Query API here
    useEffect(() => {
        if (router.isReady) {
            getDataCallback();
        }
    }, [id, router.isReady]);

    // Action Issue Materials
    const handleSubmit = async (values) => {
        setLoading(true);
        const { status, error, validationErrors } = await eraseLotStock(id, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success removed");
            router.push("/adjustment/lots/stock");
        }
        setLoading(false);
    };

    return (
        <>
            {popup && <PopupRemove opened={popup} toggle={togglePopup} id={id} />}
            <div className="page">
                <PageActions
                    backUrl="/adjustment/lots/stock"
                    title={<>Adjustments stock for lot <mark>{data?.IDlot}</mark> - stock <mark>{id}</mark></>}
                    extra={[
                        <Button key={0} danger icon={<IconTrashX />} onClick={togglePopup} loading={loadingAction}>
                            Remove lot from stock
                        </Button>,
                    ]}
                />
                <div className="page-content">
                    <Row>
                        <Col span={24}>
                            <Card title="Edit" loading={loading}>
                                <Text className="mb-3" type="secondary">
                                    Remove current lot from stock and receipt a new lot with correct dimensions (
                                    <Text mark>for divisible items will be adjusted only the quantity</Text>) :
                                </Text>

                                <Form layout="vertical" onFinish={handleSubmit} form={form} name="update-lot">
                                    <Row gutter={16}>
                                        <Col span="12">
                                            <SelectReason />
                                        </Col>
                                        <Col span="12">
                                            {data?.lot?.item?.unit?.frazionabile === 1 && (
                                                <Form.Item name="qty" label="Qty" {...validationErrorsBag.getInputErrors('qty')}>
                                                    <InputNumber allowClear />
                                                </Form.Item>
                                            )}

                                            <DynamicDimensions um={data?.lot?.item?.um} readonly={data?.lot?.item?.unit?.frazionabile} validationErrors={validationErrorsBag} />
                                        </Col>
                                    </Row>

                                    <Divider />
                                    <Form.Item>
                                        <Button type="primary" htmlType="submit" loading={loading} icon={<IconEraser />}>
                                            Remove lot from stock and receipt a new lot
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default View;

//=============================================================================
// Component Popup
//=============================================================================

const PopupRemove = ({ opened, toggle, id }) => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const validationErrorsBag = useValidationErrors();

    // Action Issue Materials
    const handleRemove = async (values) => {
        setLoading(true);
        const { status, error, validationErrors } = await deleteLotFromStock(id, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success removed");
            toggle();
            router.push("/adjustment/lots/stock");
        }
        setLoading(false);
    };

    return (
        <Modal
            open={opened}
            onCancel={toggle}
            title="Remove lot from stock"
            transitionName="ant-modal-slide-up"
            footer={[
                <Button key="back" onClick={toggle}>
                    Close
                </Button>,
                <Button key="ok" type="primary" htmlType="submit" loading={loading} form="remove-lot" icon={<IconTrashX />}>
                    Remove
                </Button>,
            ]}
        >
            <Form form={form} layout="vertical" onFinish={handleRemove} name="remove-lot">
                <SelectReason />
            </Form>
        </Modal>
    );
};

//=============================================================================
// Select component
//=============================================================================

const SelectReason = () => {
    const [reasons, setReasons] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
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
