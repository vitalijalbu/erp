import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
//import { useValidationErrors } from "@/hooks/validation-errors";
import { updateCity, createCity } from "@/api/geo/cities";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectProvince from "../selects/select-province";
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



const ModalCity = ({ opened, toggle, reload, data, onSave }) => {
  const router = useRouter();
  const { id } = router.query;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  //const [data, setData] = useState(null);
  const [country, setCountry] = useState(null);
  const [province, setProvince] = useState(null);
  const [city, setCity] = useState(null);
  const [selected, setSelected] = useState(null);
  const [formChanged, setFormChanged] = useState(false);
  const validationErrorsBag = useValidationErrors();

  useEffect(() => {
    if (data) {
      form.setFieldsValue({
        name: data?.name,
        province_id: data?.province?.id,
        nation_id: data?.nation?.id,
      });
      setCity(data?.name);
      setCountry(data?.nation?.id);
      setProvince(data?.province?.id);
      setFormChanged(true);
    } else {
      form.resetFields();
    }
  }, [data]);

  const handleCountryChange = (value) => {
    if (value !== country) {
      form.resetFields(['province_id']);
    }
    form.setFieldValue('nation_id', value);
    setCountry(value);
  }

  const handleProvinceChange = (value) => {
    form.setFieldValue('province_id', value)
    setProvince(value);
  }

  /*   const handleCityChange = (value) => {
        form.setFieldValue('name', value)
        setCity(value)
    }
   */

    // Form Submit
    const handleSubmit = async (values) => {
      setLoading(true);
      validationErrorsBag.clear();
    
      try {
        let result;
    
        if (data) {
          result = await updateCity(data?.id, values);
        } else {
          result = await createCity(values);
        }
    
        const { status, error, validationErrors, data: responseData } = result;
    
        if (error) {
          if (validationErrors) {
            validationErrorsBag.setValidationErrors(validationErrors);
          }
          message.error("Error while saving, please retry");
        } else {
          const successMessage = data
            ? "City updated successfully"
            : "City created successfully";
          message.success(successMessage);
          toggle();
          if(!data){
            onSave(responseData);
          }
          // Use responseData if available, otherwise use data
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
          Update the city - <mark>{data?.name}</mark>
        </>
      ) : ("Add new city")}
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
          form="form-city"
          loading={loading}

        >
          Save
        </Button>,
      ]}
    >
      <Form
        layout="vertical"
        form={form}
        name="form-city"
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
              <SelectCountry onChange={(value) => handleCountryChange(value)} disabled={!data ? (false) : (true)} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Province"
              name="province_id"
              {...validationErrorsBag.getInputErrors('province_id')}
            >
              <SelectProvince onChange={(value) => handleProvinceChange(value)} disabled={!data ? (!formChanged) : (true)}
                countryId={country} />
            </Form.Item>
          </Col>


        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="City"
              name="name"
              rules={[
                {
                  required: true,
                },
              ]}
              {...validationErrorsBag.getInputErrors('name')}
            >
              <Input allowClear disabled={!country} value={city} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default ModalCity;