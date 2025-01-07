import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { getItemById, setAlternativeCode } from "@/api/items";
import {
    Row,
    Col,
    Space,
    Button,
    Modal,
    Form,
    message,
    Tag,
    Card,
    Select,
    Input
} from "antd";
const { confirm } = Modal;
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";



const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items.management")) {
        return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [item, setItem] = useState(null);

    const router = useRouter();
    const validationErrorsBag = useValidationErrors();

    useEffect(() => {
        if (router.isReady) {
            setLoading(true);
            (async () => {
                const { data, error } = await getItemById(router.query.id)
                if (!error) {
                    setItem(data);
                    form.setFieldValue('altv_code', data.alternative_code);
                    form.setFieldValue('altv_desc', data.alternative_description);
                }
                else {
                    message.error("Error during item loading")
                }
                setLoading(false);
            })();
        }
    }, [router.isReady]);

    const updateDetails = async () => {
        setLoading(true);
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await setAlternativeCode(
            router.query.id,
            form.getFieldsValue()
        );
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            
            message.error(error?.response?.data?.message || "Error during saving operation");
        }
        else {
            message.success("Item details saved successfully");
            router.push('/items');
        }
        setLoading(false);
    }

    return (
        <div className="page">
            {item &&
                <>
                    <PageActions
                        backUrl="/items"
                        title={
                            <>  Alternative details for item <mark>{item.item} - {item.item_desc}</mark>
                            </>
                        }
                    >
                    </PageActions>

                    <div className="page-content">
                        <Row>
                            <Col span={24} className="mb-3">
                                <Card
                                    title="Insert new stock item limits"
                                    className="mb-3"
                                    actions={[
                                        <div className="d-flex card-action-container">
                                            <Button key="submit" htmlType="submit" type="primary" onClick={updateDetails} loading={loading}>
                                                Save
                                            </Button>
                                        </div>
                                    ]}
                                >
                                    <Form
                                        layout="vertical"
                                        form={form}
                                        onFinish={updateDetails}
                                    >
                                        <Form.Item
                                            label="Alternative Code"
                                            name="altv_code"
                                            {...validationErrorsBag.getInputErrors('altv_code')}
                                        >
                                            <Input allowClear />
                                        </Form.Item>
                                        <Form.Item
                                            label="Alternative Description"
                                            name="altv_desc"
                                            {...validationErrorsBag.getInputErrors('altv_desc')}
                                        >
                                            <Input allowClear />
                                        </Form.Item>
                                    </Form>
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
