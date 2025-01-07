import React, { useEffect, useState } from 'react';
import {
    Button,
    Col,
    Drawer,
    Form,
    Input,
    Row,
    Space,
    message
} from 'antd';
import { updateLotText } from "@/api/lots";
import { useValidationErrors } from "@/hooks/validation-errors";
const { TextArea } = Input;


const EditLotTextDreawer = (props) => {

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const validationErrorsBag = useValidationErrors();

    useEffect(() => {
        form.resetFields();
        if (props.currentEditLot) {
            form.setFieldsValue({
                note: props.currentEditLot.note?.toString(),
                ordRef: props.currentEditLot.lot_ord_rif?.toString(),
            });
        }

    }, [props.currentEditLot]);

    const updateLot = async () => {
        setLoading(true);
        validationErrorsBag.clear();
        const { status, error, validationErrors } = await updateLotText(
            props.currentEditLot.id_lot,
            form.getFieldsValue()
        );
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(error?.response?.data?.message || "Error during lot update operation");
        }
        else {
            message.success("Lot updated successfully");
            props.onClose();
            props.reload();
        }
        setLoading(false);
    }

    return (
        <Drawer
            title={props.currentEditLot ? (
                <>
                    Update Lot - <mark>{props.currentEditLot.id_lot}</mark>
                </>
            ) : ("")}
            onClose={props.onClose}
            open={props.open}
            width={600}
            extra={
                <Space>
                    <Button loading={loading} onClick={() => updateLot()} type="primary">
                        Save
                    </Button>
                </Space>
            }
        >
            <Form layout="vertical" form={form}>
                <Row gutter={16}>
                    <Col span={24}>
                        <Form.Item name="note" label="Lot Text" {...validationErrorsBag.getInputErrors('note')}>
                            <TextArea></TextArea>
                        </Form.Item>
                        <Form.Item name="ordRef" label="Order Ref" {...validationErrorsBag.getInputErrors('ordRef')}>
                            <Input allowClear />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Drawer>
    );
};

export default EditLotTextDreawer;