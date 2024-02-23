import React, { useState } from "react";
import {
  Row,
  Col,
  Form,
  Switch
} from "antd";
import SelectAddress from "@/shared/addresses/select-address";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectLanguageDoc from "@/shared/form-fields/select-language-doc";
import SelectShippingMethod from "@/shared/form-fields/bp/select-shipping-method";
import SelectPaymentMethod from "@/shared/form-fields/bp/select-payment-method";
import SelectPaymentTerm from "@/shared/form-fields/bp/select-payment-term";


const FormInvoice = (props) => {
  const [isActive, setIsActive] = useState(props?.form.getFieldValue("is_invoice"));

  const handleAddressChange = (value) => {
    
		props?.form.setFieldValue("sales_address_id", value);
  };

  const handleContactChange = (value, field) => {
		props?.form.setFieldValue(field, value);
  };

  return (
    <Row gutter={16}>
      <Col span={24}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label="Activate" 
                name="is_invoice"
                valuePropName="checked"
                initialValue={false}
                {...props?.errors?.getInputErrors('is_invoice')}>
                <Switch checked={isActive} checkedChildren="Yes" unCheckedChildren="No" onChange={() => { setIsActive(!isActive) }} rules={[{ required: true }]}/>
              </Form.Item>
            </Col>
            <Col span={12}>
            <Form.Item
              label="Address" name="invoice_address_id"
              {...props?.errors?.getInputErrors('invoice_address_id')}>
              <SelectAddress 
              disabled={!isActive} 
              onChange={(value) => handleAddressChange(value)}  
              />
            </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Contact" name="invoice_contact_id"
                {...props?.errors?.getInputErrors('invoice_contact_id')}>
                <SelectContact disabled={!isActive}
                 onChange={(value) => handleContactChange(value, 'invoice_contact_id')}
                 />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Payment method"
                name="invoice_payment_method_id"
                {...props?.errors?.getInputErrors(
                  "invoice_payment_method_id",
                )}
              >
                <SelectPaymentMethod 
                disabled={!isActive} />
              </Form.Item>
            </Col>   
            <Col span={12}>
              <Form.Item
                label="Payment terms"
                name="invoice_payment_term_id"
                {...props?.errors?.getInputErrors(
                  "invoice_payment_term_id",
                )}
              >
                <SelectPaymentTerm 
                disabled={!isActive} />
              </Form.Item>
            </Col>  
            <Col span={12}>
              <Form.Item
                label="Shipping method"
                name="invoice_shipping_method_id"
                {...props?.errors?.getInputErrors(
                  "invoice_shipping_method_id",
                )}
              >
                <SelectShippingMethod 
                disabled={!isActive}/>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Language DOC"
                name="invoice_document_language_id"
                {...props?.errors?.getInputErrors(
                  "invoice_document_language_id",
                )}
              >
                <SelectLanguageDoc 
                disabled={!isActive} />
              </Form.Item>
            </Col>
          </Row>
      </Col>
    </Row>
  )



}

export default FormInvoice;