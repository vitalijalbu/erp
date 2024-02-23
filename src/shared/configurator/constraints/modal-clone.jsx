import React, { useState, useRef } from "react";
import {
  cloneConstraint
} from "@/api/configurator/constraints";
import { Button, Modal, message, Form, Input } from "antd";
import { useValidationErrors } from "@/hooks/validation-errors";

const ModalClone = ({ opened, toggle, data, reload }) => {

  const [form] = Form.useForm();
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const validationErrorsBag = useValidationErrors();

  const handleSubmit = async (values) => {

    // format the date fields
    setLoading(true);
    const { status, error, validationErrors } = await cloneConstraint(
      data?.id,
      values
    );
    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
        setLoading(false);
      }
      message.error("Error during cloning operation");
    } else {
      message.success("Constraint cloned successfully.");
      setLoading(false);
      toggle();
      reload();
    }
  };

  return (
    <Modal
      open={opened}
      onCancel={toggle}
      width={"40%"}
      centered
      maskClosable={!isFormChanged}
      transitionName="ant-modal-slide-up"
      title={<>Enter new ID for the duplication of <mark>{data?.id}</mark></>}
      footer={[
        <Button key={0} onClick={toggle}>Close</Button>,
        <Button key="submit"
          type="primary"
          htmlType="submit"
          form="form-clone-constraint"
          loading={loading}
          disabled={!isFormChanged}>
          Save
        </Button>
      ]}
    >
      <Form onValuesChange={() => setIsFormChanged(true)} disabled={loading} form={form} ref={formRef} name="form-clone-constraint" layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="new_id"
          label="New ID"
          {...validationErrorsBag.getInputErrors("new_id")}
          rules={[{ required: true, message: "Required field" }]}
        >
          <Input allowClear />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalClone;
