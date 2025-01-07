import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
//import { useValidationErrors } from "@/hooks/validation-errors";
import { updateProvince, createProvince } from "@/api/geo/provinces";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectCountry from "../selects/select-country";
import {
  Button,
  Row,
  Col,
  Form,
  Modal,
  Input,
  message,
} from "antd";
import _ from "lodash";

const ModalProvince = ({ opened, toggle, reload, data, onSave }) => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // const [data, setData] = useState(null);
  const [country, setCountry] = useState(null);
  const [province, setProvince] = useState(null);
  const [provinceCode, setProvinceCode] = useState(null);
  const [selected, setSelected] = useState(null);
  const [formChanged, setFormChanged] = useState(false);
  const validationErrorsBag = useValidationErrors();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        code: data?.code,
        nation_id: data?.nation?.id,
      });
      setCountry(data?.nation?.id)
      setProvince(data?.name);
      setProvinceCode(data?.code)
      setFormChanged(true);
    } else {
      form.resetFields();
    }
  }, [data]);

  const handleCountryChange = (value) => {
    if (value !== country) {
      form.resetFields(['name']);
    }
    form.setFieldValue('nation_id', value);
    setCountry(value);
  }

  const handleProvinceChange = (value) => {
    if (typeof value === "string") {
      if (value !== province) {
        form.resetFields(['code'])
      }
      form.setFieldValue('name', value);
      setProvince(value);
    }

  }


  // Form Submit
  const handleSubmit = async (values) => {
    setLoading(true);
    validationErrorsBag.clear();
  
    try {
      let result;
  
      if (data) {
        result = await updateProvince(data?.id, values);
      } else {
        result = await createProvince(values);
      }
  
      const { status, error, validationErrors, data: responseData } = result;
  
      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error while saving, please retry");
      } else {
        const successMessage = data
          ? "Province updated successfully"
          : "Province created successfully";
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
      title={data?.id ? (
        <>
          Update the province - <mark>{data?.name}</mark>
        </>
      ) : ("Add new province")}
      centered
      maskClosable={false}
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={toggle}>
          Close
        </Button>,
        <Button
          disabled={!formChanged}
          key={1}
          type="primary"
          htmlType="submit"
          form="form-province"
          loading={loading}
        // onClick={handleSubmit}
        >
          Save
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        name="form-province"
        onFinish={handleSubmit}
        onValuesChange={() => setFormChanged(true)}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Country"
              name="nation_id"
              rules={[
                {
                  required: true,
                },
              ]}
              {...validationErrorsBag.getInputErrors('nation_id')}
            >
              <SelectCountry /*disabled={!data ? (false) : (true)}*/ onChange={(value) => handleCountryChange(value)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Province"
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
              {...validationErrorsBag.getInputErrors('name')}
            >
              <Input allowClear disabled={!data ? (!country) : (false)} />
            </Form.Item>
          </Col>

        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Province Code"
              name="code"
              rules={[
                {
                  required: true,
                },
              ]}
              {...validationErrorsBag.getInputErrors('code')}
            >
              <Input allowClear disabled={!data ? (!country) : (false)} countryId={country} value={provinceCode} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalProvince;
