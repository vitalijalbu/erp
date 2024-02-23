import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Input, message, Modal, Switch, Select } from "antd";
import {
  createSalePricelist,
  getSalePricelist,
  updateSalePricelist
} from "@/lib/api/sales/pricelist";
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";

import { parseBoolInv } from "@/hooks/formatter";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import TableRows from "./table-rows";

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
    const payload = {
      ...values,
      quotation_default: parseBoolInv(values.quotation_default)
    };
    props?.data?.id && delete payload['currency_id'];
    try {
      const { error, data, errorMsg, validationErrors } = props?.data?.id
        ? await updateSalePricelist(props.data.id, payload)
        : await createSalePricelist(values);
  
      props?.onLoading(true);
  
      if (error) {
        console.log('error', validationErrors);
        if (validationErrors) {
          validationErrorsBag.setValidationErrors(validationErrors);
        }
        message.error(errorMsg);
      } else {
        message.success("Sales pricelist saved successfully");
        props?.toggle?.();
        props?.reload?.();
        if (!props?.data?.id && props?.isModal === false) {
          router.push(!!data?.id ? `/sales/sales-pricelist/${data?.id}` : `/sales/sales-pricelist`);
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
              code: props?.data?.code,
              currency_id: props?.data?.currency_id,
              bp_id: props?.data?.bp_id
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
                    label="Code"
                    name="code"
                    {...validationErrorsBag.getInputErrors("code")}
                  >
                    <Input />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Business Partner"
                    name="bp_id"
                    
                    {...validationErrorsBag.getInputErrors("bp_id")}
                  >
                    <SelectBP onChange={(value) =>
													form.setFieldValue("bp_id", value)
												}/>
                  </Form.Item>
                </Col> 
                 <Col span={12}>
                  <Form.Item
                    label="Currency"
                    name="currency_id"
                    
                    {...validationErrorsBag.getInputErrors("currency_id")}
                  >
                    <SelectCurrency setDefault={(value)=> form.setFieldValue('currency_id', value)}/>
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
