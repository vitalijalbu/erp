import React, { useState, useEffect } from "react";
import { Row, Col, Form, Switch } from "antd";
import SelectAddress from "@/shared/addresses/select-address";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectLanguageDoc from "@/shared/form-fields/select-language-doc";
import SelectPaymentMethod from "@/shared/form-fields/bp/select-payment-method";
import SelectPaymentTerm from "@/shared/form-fields/bp/select-payment-term";
import { IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";

const FormPurchases = (props) => {
  const [isActive, setIsActive] = useState(props?.form.getFieldValue("is_purchase"));

  const handleSelectChange = (value, field) => {
    
		props?.form.setFieldValue(field, value);
  };


  return (
      <Row gutter={16} className="mb-3">
        <Col span={24}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Activate"
                name="is_purchase"
                valuePropName="checked"
                initialValue={false}
                {...props?.errors?.getInputErrors("is_purchase")}
              >
                <Switch
                  checked={isActive}
                  checkedChildren="Yes"
                  unCheckedChildren="No"
                  onChange={() => {
                    setIsActive(!isActive);
                  }}
                  rules={[{ required: true }]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Address"
                name="purchase_address_id"
                {...props?.errors?.getInputErrors("purchase_address_id")}
              >
                <SelectAddress
                  disabled={!isActive}
                  onChange={(value) => handleSelectChange(value, "purchase_address_id")}  
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Contact"
                name="purchase_contact_id"
                {...props?.errors?.getInputErrors("purchase_contact_id")}
              >
                <SelectContact
                  disabled={!isActive}
                  onChange={(value) => handleSelectChange(value, 'purchase_contact_id')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Currency"
                name="purchase_currency_id"
                {...props?.errors?.getInputErrors("purchase_currency_id")}
              >
                <SelectCurrency disabled={!isActive} setDefault={(value)=> props.form.setFieldValue('purchase_currency_id', value)} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Language DOC"
                name="purchase_document_language_id"
                {...props?.errors?.getInputErrors("purchase_document_language_id")}
              >
                <SelectLanguageDoc disabled={!isActive} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment method"
                name="purchase_payment_method_id"
                {...props?.errors?.getInputErrors("purchase_payment_method_id")}
              >
                <SelectPaymentMethod disabled={!isActive} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment term"
                name="purchase_payment_term_id"
                {...props?.errors?.getInputErrors("purchase_payment_term_id")}
              >
                <SelectPaymentTerm disabled={!isActive} />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
  );
};

export default FormPurchases;
