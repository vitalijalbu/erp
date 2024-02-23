import React, { useState, useEffect, useCallback } from "react";
import {
  createWorkcenter,
  updateWorkcenter
} from "@/api/workcenters";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Spin, Button, Form, Modal, Input, message } from "antd";

const ModalWorkcenter = ({ opened, toggle, data, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();

  // Form Submit
  const handleSubmit = useCallback(async (values) => {
    setLoading(true);
    try {
      let status, error, validationErrors;

      if (data) {
        // Update existing 
        ({ status, error, validationErrors } = await updateWorkcenter(data.id, values));
      } else {
        // Create new 
        ({ status, error, validationErrors } = await createWorkcenter(values));
      }

      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error during saving operation");
      } else {
        const successMessage = data ? "Workcenter updated successfully" : "Workcenter created successfully";
        message.success(successMessage);
        toggle();
        reload();
      }
    } catch (error) {
      message.error("Error during saving operation");
    } finally {
      setLoading(false);
    }
  }, [data, toggle, validationErrorsBag, reload]);


  //Fill form
  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data.name
      });
    } else {
      form.resetFields();
    }
  }, [data, form]);


  return (
    <Modal
      open={opened}
      onCancel={toggle}
      title={data ? (
        <>
          Update workcenter - <mark>{data.name}</mark>
        </>
      ) : ("Create new workcenter")
      }
      centered
      maskClosable={false}
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={toggle}>
          Close
        </Button>,
        <Button key={1} type="primary" htmlType="submit" form="workcenter-form">
          {data ? "Save" : "Create"}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form
          layout="vertical"
          name="workcenter-form"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item label="Name" name="name" rules={[{ required: true }]} {...validationErrorsBag.getInputErrors("name")}>
            <Input allowClear />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalWorkcenter;
