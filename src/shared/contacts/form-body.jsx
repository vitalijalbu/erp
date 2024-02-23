import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Input, message, Modal, Switch, Select } from "antd";
const { confirm } = Modal;
const { TextArea } = Input;
import {
  createContact,
  updateContact
} from "@/lib/api/contacts";
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";
import SelectAddress from "@/shared/addresses/select-address";
import SelectLanguage from "@/shared/form-fields/select-language";
import SelectContactType from "@/shared/form-fields/contacts/select-contact-type";
import { parseBool } from "@/hooks/formatter";

const FormBody = (props) => {
  const router = useRouter();

  const [form] = Form.useForm();
  // const formBody = Form.useWatch([], { form, preserve: true });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const validationErrorsBag = useValidationErrors();

  const handleAddressChange = (value) => {
    if (_.isNull(value)) {
      form.resetFields(["address_id"]);
      return
    };

    form.setFieldValue("address_id", value);
  }


  // Submit form
  const handleSubmit = async (values) => {
    validationErrorsBag.clear();

    try {
      const { error, data, validationErrors } = props?.data?.id
        ? await updateContact(props.data.id, values)
        : await createContact(values);

      props?.onLoading(true);

      if (error) {
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error during saving operation");
      } else {
        message.success("Contact saved successfully");

        if (!props.isModal) {
          router.push(`/contacts`);
        } else {
          data ? props.onSave(data) : props.onSave();
          props?.reload?.();
          props?.toggle?.();
        };
        
      }
    } catch (error) {
      console.error('An error occurred:', error);
    } finally {
      props?.onLoading?.(false);
    }
  };


  // Get API data
  useEffect(() => {
    setLoading(true);
    if (props?.data) {
      // Set state data response also
      setData(data);
      // fill form  
      form.setFieldsValue({
        name: props?.data?.name,
        department: props?.data?.department,
        email: props?.data?.email,
        contact_type_id: parseInt(props?.data?.contact_type_id) || null,
        type: props?.data?.type || 'person',
        address_id: props?.data?.address_id,
        mobile_phone: props?.data?.mobile_phone,
        office_phone: props?.data?.office_phone,
        language: props?.data?.language,
        is_employee: parseBool(props?.data?.is_employee) || false,
        note: props?.data?.note
      });
    }
  }, [props?.data]);



  return (
    <div className="page-content">
      <Row gutter={16}>
        <Col span={24}>
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            name="form-contact"
            onValuesChange={() => props?.changesWatcher(true)}
          >
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  label="Type"
                  name="type"
                  initialValue={'person'}
                  {...validationErrorsBag.getInputErrors("type")}
                >
                  <Select
                    options={[{ value: "person", label: "Person" }, { value: "business", label: "Business" }]}
                    placeholder="Select person or business"
                    name="type"
                    allowClear
                    defaultActiveFirstOption
                    optionFilterProp="children" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label={form.getFieldValue('type') == 'person' ? "Name and surname" : "Denomination"}
                  name="name"
                  {...validationErrorsBag.getInputErrors("name")}
                >
                  <Input allowClear />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Address"
                  name="address_id"
                  {...validationErrorsBag.getInputErrors("address_id")}
                >
                  <SelectAddress
                    onChange={(value) => handleAddressChange(value)}
                  // onRemove={() => form.resetFields(["address_id"])}
                  />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Department"
                  name="department"
                  {...validationErrorsBag.getInputErrors("department")}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Contact type"
                  name="contact_type_id"
                  {...validationErrorsBag.getInputErrors("contact_type_id")}
                >
                  <SelectContactType />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Language"
                  name="language"
                  {...validationErrorsBag.getInputErrors("language")}
                >
                  <SelectLanguage />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="E-mail"
                  name="email"
                  {...validationErrorsBag.getInputErrors("email")}
                >
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone"
                  name="mobile_phone"
                  {...validationErrorsBag.getInputErrors("mobile_phone")}
                >
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Phone office"
                  name="office_phone"
                  {...validationErrorsBag.getInputErrors("office_phone")}
                >
                  <Input allowClear />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  label="Is employee?"
                  name="is_employee"
                  valuePropName="checked"
                  initialValue={false}
                  {...validationErrorsBag.getInputErrors("is_employee")}
                >
                  <Switch
                    defaultChecked={false}
                    checked={form.getFieldValue("is_employee")}
                    checkedChildren="Yes"
                    unCheckedChildren="No" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  label="Notes"
                  name="note"
                  {...validationErrorsBag.getInputErrors("note")}
                >
                  <TextArea rows="6" allowClear />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default FormBody;
