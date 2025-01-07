import React, { useState, useEffect, useCallback } from "react";
import {
  createFunctionCategory,
  updateFunctionCategory
} from "@/api/configurator/functions";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Space, Spin, Button, Row, Col, Form, Modal, Input, message } from "antd";
import SelectFunctionCategory from "@/shared/form-fields/other/select-function-category";

const ModalFunctionCategory = ({ opened, toggle, data, reload }) => {
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
        ({ status, error, validationErrors } = await updateFunctionCategory(data.id, values));
      } else {
        // Create new 
        ({ status, error, validationErrors } = await createFunctionCategory(values));
      }

      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error during saving operation");
      } else {
        const successMessage = data ? "Category updated successfully" : "Category created successfully";
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
        name: data.name,
        parent_id: data.parent_id ?? undefined,
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
          Update category - <mark>{data.name}</mark>
        </>
      ) : ("Create new category function")
      }
      centered
      maskClosable={false}
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={toggle}>
          Close
        </Button>,
        <Button key={1} type="primary" htmlType="submit" form="category-form">
          {data ? "Save" : "Create"}
        </Button>,
      ]}
    >
      <Spin spinning={loading}>
        <Form
          layout="vertical"
          name="category-form"
          form={form}
          onFinish={handleSubmit}
        >
          <Form.Item label="Name category" name="name" rules={[{ required: true }]} {...validationErrorsBag.getInputErrors("name")}>
            <Input allowClear />
          </Form.Item>
          <Form.Item label="Parent category" name="parent_id" {...validationErrorsBag.getInputErrors("parent_id")}>
            <SelectFunctionCategory />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default ModalFunctionCategory;
