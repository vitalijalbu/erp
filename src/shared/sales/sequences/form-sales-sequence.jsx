import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Input, message, Modal, Switch, Select } from "antd";
import {
  createSaleSequence,
  updateSaleSequence,
} from "@/lib/api/sales/sequences";
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";

import { parseBoolInv } from "@/hooks/formatter";

const FormBody = (props) => {
  const router = useRouter();

  const [form] = Form.useForm();
  const formBody = Form.useWatch([], { form, preserve: true });

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({});
  const validationErrorsBag = useValidationErrors();


  // Submit form
  const handleSubmit = async (values) => {
    validationErrorsBag.clear();
    //console.log("✅ form-submit", values);
    const payload = {
      ...values,
      quotation_default: parseBoolInv(values.quotation_default),
      sale_default: parseBoolInv(values.sale_default),
    };
    props?.data?.id && delete payload['prefix'];
    try {
      const { error, data, validationErrors } = props?.data?.id
        ? await updateSaleSequence(props.data.id, payload)
        : await createSaleSequence(values);
  
      props?.onLoading(true);
  
      if (error) {
        console.log('error', validationErrors);
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error("Error during saving operation");
      } else {
        message.success("Sales sequence saved successfully");
        props?.toggle?.();
        props?.reload?.();
        if (!props?.data?.id && props?.isModal === false) {
          router.push(!!data?.id ? `/sales/sequences/${data?.id}` : `/sales/sequences`);
      }
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
              description: props?.data?.description,
              prefix: props?.data?.prefix,
              quotation_default: props?.data?.quotation_default,
              sale_default: props?.data?.sale_default,
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
                    label="Name"
                    name="name"
                    {...validationErrorsBag.getInputErrors("name")}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Prefix"
                    name="prefix"
                    
                    {...validationErrorsBag.getInputErrors("prefix")}
                  >
                    <Input minLength={4} maxLength={4} disabled={ props?.data?.id}/>
                  </Form.Item>
                </Col>
            


                <Col span={12}>
                <Form.Item
                label="Quotation Default"
                name="quotation_default"
                valuePropName="checked"
                initialValue={false}
                {...validationErrorsBag.getInputErrors("quotation_default")}
              >
                <Switch 
                defaultChecked={false}
                checked={form.getFieldValue("quotation_default")} 
                checkedChildren="Yes" 
                unCheckedChildren="No"  />
              </Form.Item>
              </Col>
      
                <Col span={12}>
                <Form.Item
                label="Sale Default"
                name="sale_default"
                valuePropName="checked"
                initialValue={false}
                {...validationErrorsBag.getInputErrors("sale_default")}
              >
                <Switch 
                defaultChecked={false}
                checked={form.getFieldValue("sale_default")} 
                checkedChildren="Yes" 
                unCheckedChildren="No"  />
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
