import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
//import { useValidationErrors } from "@/hooks/validation-errors";
import { updateZipCode, createZipCode } from "@/api/geo/zip-codes";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectCity from "../selects/select-city";
import { Button, Row, Col, Form, Modal, Input, message } from "antd";
const { TextArea } = Input;

const ModalZipCode = ({ opened, toggle, reload, data, cityId, onSave }) => {
    const router = useRouter();
    const { id } = router.query;
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    //const [data, setData] = useState(null);
    const [city, setCity] = useState(null);
    const [zipcode, setZipcode] = useState(null);
    const [description, setDescription] = useState(null);
    const [selected, setSelected] = useState(null);
    const [formChanged, setFormChanged] = useState(false);
    const validationErrorsBag = useValidationErrors();

    useEffect(() => {
        if (data) {
            form.setFieldsValue({
                code: data?.code,
                city_id: data?.city.id,
                description: data?.description,
            });
            setCity(data?.city?.id);
            setZipcode(data?.code);
            setDescription(data?.description);
            setFormChanged(true);
        } else {
            form.resetFields();
        }
    }, [data]);

    const handleCityChange = (value) => {
        if (value !== city) {
            form.resetFields(["code"]);
        }
        form.setFieldValue("city_id", value);
        setCity(value);
    };

    const handleZipCodeChange = (value) => {
        if (value !== zipcode) {
            form.resetFields(["description"]);
        }
        form.getFieldValue("code", value);
        setZipcode(value);
    };

    // Form Submit
    const handleSubmit = async (values) => {
      setLoading(true);
      validationErrorsBag.clear();
    
      try {
        let result;
    
        if (data) {
          result = await updateZipCode(data?.id, values);
        } else {
          result = await createZipCode(values);
        }
    
        const { status, error, validationErrors, data: responseData } = result;
    
        if (error) {
          if (validationErrors) {
            validationErrorsBag.setValidationErrors(validationErrors);
          }
          message.error("Error while saving, please retry");
        } else {
          const successMessage = data
            ? "Zip Code updated successfully"
            : "Zip Code created successfully";
          message.success(successMessage);
          toggle();
          if(!data){
            onSave(responseData);
          } // Use responseData if available, otherwise use data
          reload();
          setFormChanged(false); // Reset formChanged state on successful submit
        }
      } catch (error) {
        console.error("An error occurred during form submission:", error);
        message.error("An unexpected error occurred. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    

    return (
        <Modal
            open={opened}
            onCancel={toggle}
            width={"60%"}
            title={
                data?.id ? (
                    <>
                        Update the zip code - <mark>{data?.code}</mark>
                    </>
                ) : (
                    "Add new zip code"
                )
            }
            centered
            maskClosable={false}
            transitionName="ant-modal-slide-up"
            footer={[
                <Button key={0} onClick={toggle}>
                    Close
                </Button>,
                <Button disabled={!formChanged} key={1} type="primary" htmlType="submit" form="form-zip-code" loading={loading}>
                    Save
                </Button>,
            ]}
        >
            <Form layout="vertical" form={form} name="form-zip-code" onFinish={handleSubmit} onValuesChange={() => setFormChanged(true)}>
                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            label="City"
                            name="city_id"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            {...validationErrorsBag.getInputErrors("city_id")}
                        >
                            <SelectCity disabled={!data ? false : true} onChange={(value) => handleCityChange(value)} />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            label="Code"
                            name="code"
                            rules={[
                                {
                                    required: true,
                                },
                            ]}
                            {...validationErrorsBag.getInputErrors("code")}
                        >
                            <Input allowClear disabled={!data ? !city : false} onChange={(value) => handleZipCodeChange(value)} />
                        </Form.Item>
                    </Col>

                    <Col span={24}>
                        <Form.Item label="Description" name="description" {...validationErrorsBag.getInputErrors("description")}>
                            <TextArea type="text" disabled={!data ? !zipcode : false} value={description} />
                        </Form.Item>
                    </Col>
                </Row>
            </Form>
        </Modal>
    );
};

export default ModalZipCode;
