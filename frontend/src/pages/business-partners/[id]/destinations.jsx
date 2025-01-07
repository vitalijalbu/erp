import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { IconTrash, IconAlertCircle } from "@tabler/icons-react";
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Button,
    message,
    List
} from "antd";
import PageActions from "@/shared/components/page-actions";
import { getBPById, createBPDestination, updateBPDestination } from "@/lib/api/bp"
import { useValidationErrors } from "@/hooks/validation-errors";


const Destinations = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const router = useRouter();
    const { id } = router.query;

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const validationErrorsBag = useValidationErrors();

    useEffect(() => {
        if (router.isReady) {
            (async () => {
                await loadBP(id);
            })();
        }
    }, [router.isReady]);

    const loadBP = async (id) => {
        setLoading(true);
        var { data, error } = await getBPById(id)
        if (!error) {
            setData(data);
        }
        setLoading(false);
    }

    const addDestination = async (values) => {
        setLoading(true);
        var { status, error, validationErrors } = await createBPDestination(id, form.getFieldsValue());
        setLoading(false);

        validationErrorsBag.clear();
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        }
        else {
            message.success("Business Partner Destination saved succesfully");
            form.setFieldValue('desc', null);
            await loadBP(id);
        }
    };

    return (
            <div className="page">
                <PageActions
                    backUrl="/business-partners"
                    title={<> Destinations - <mark>{data?.desc}</mark> </>}
                />
                <div className="page-content">
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card title="Destinations / Addresses" className="mb-3">
                                <List
                                    size="small"
                                    dataSource={data.bp_destinations}
                                    renderItem={(destination) => <List.Item>{destination.desc}</List.Item>}
                                />
                            </Card>
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={24}>
                            <Card
                                title="Add new Destination / Address"
                                className="mb-3"
                                actions={[
                                    <div className="d-flex card-action-container">
                                        <Button key="submit" htmlType="submit" type="primary" onClick={addDestination} loading={loading}>
                                            Save
                                        </Button>
                                    </div>
                                ]}
                            >
                                <Form
                                    layout="vertical"
                                    form={form}
                                    onFinish={addDestination}
                                    name="destination-form"
                                >
                                    <Form.Item
                                        label="Destination Name"
                                        name="desc"
                                        {...validationErrorsBag.getInputErrors('desc')}
                                    >
                                        <Input allowClear/>
                                    </Form.Item>

                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
    );
};

export default Destinations;
