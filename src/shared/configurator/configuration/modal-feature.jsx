import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import { createFeature } from "@/api/configurator/features";
import { getFeaturesTypes } from "@/api/configurator/features";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Row, Col, Button, Form, message, Input, Select, Modal } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";

const ModalFeature = ({ opened, toggle, reload, onSave }) => {
  //Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const router = useRouter();
  const validationErrorsBag = useValidationErrors();

  const [featuresType, setFeaturesType] = useState([]);

  //Save feature API
  const handleSubmit = async (values) => {
    setLoading(true);
    validationErrorsBag.setValidationErrors([]);
    const { status, error, validationErrors, data } = await createFeature(values);
    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
      }
      message.error("Error during saving operation");
      setLoading(false);
    } else {
      message.success("Feature saved successfully");
      toggle();

      data ? onSave(data) : onSave();

      reload();
    }
  };

  //Close modal confirmation if form state is TRUE
  const handleExit = () => {
    if (formChanged === true) {
      confirm({
        title: "Confirm exit without saving?",
        icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
        transitionName: "ant-modal-slide-up",
        content: "Seems like you forgot to save your edits",
        okText: "Exit",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
          toggle();
          setFormChanged(false);
        },
      });
    } else {
      toggle();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data, error } = await getFeaturesTypes();
        if (!error) {
          setFeaturesType(
            data.map(({ id, label }) => ({
              value: id,
              label: `${label}`,
            })),
          );
        }
      } catch (error) {
        message.error("Error occurred while fetching feature types");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Modal
      open={opened}
      width={"60%"}
      destroyOnClose={true}
      onCancel={handleExit}
      title="Create new Feature"
      centered
      maskClosable={false}
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={handleExit}>
          Close
        </Button>,
        <Button
          key={1}
          form={"formFeature"}
          type="primary"
          htmlType="submit"
          loading={loading}
          // onClick={handleSubmit}
          disabled={!formChanged}
        >
          Save
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        disabled={loading}
        onFinish={handleSubmit}
        onValuesChange={() => setFormChanged(true)}
        name="formFeature"
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="ID" name="id"  {...validationErrorsBag.getInputErrors("id")}>
              <Input allowClear />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Label"
              name="label"
              
              {...validationErrorsBag.getInputErrors("label")}
            >
              <Input allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item
          label="Feature type"
          name="feature_type_id"
          
          {...validationErrorsBag.getInputErrors("feature_type_id")}
        >
          <Select options={featuresType} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ModalFeature;
