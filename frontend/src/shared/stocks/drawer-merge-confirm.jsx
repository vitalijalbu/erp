import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  InputNumber,
  Row,
  Space,
  message,
} from "antd";
import { updateLotText } from "@/api/lots";
import { useValidationErrors } from "@/hooks/validation-errors";
const { TextArea } = Input;
import LocationSelect from "@/shared/form-fields/location-select";
import { IconCheckbox } from "@tabler/icons-react";

const MergeConfirm = ({ opened, toggle, data, reload }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();

  //Calculate function input
  const calculateAreaM2 = (changedValues, allValues) => {
    const { LA, LU, PZ } = allValues;
  
    // Convert input values to numbers
    const width = parseFloat(LA);
    const length = parseFloat(LU);
    const pieces = parseFloat(PZ);
  
    // Check if all form fields have valid numeric values
    if (!isNaN(width) && !isNaN(length) && !isNaN(pieces)) {
      const m2 = width * length * pieces / 1000000;
      form.setFieldsValue({ aream2: m2 });
      //console.log('changed m2', m2);
    }
  };

      // Action Submit Form
      const handleSubmit = async (values) => {
        setLoading(true);
        console.log("✅ values-form: ", values);
       /* const { status, error, validationErrors } = await eraseLotStock(id, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
                setLoading(false);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Success removed");
            reload();
        }*/
    };

  

  return (
    <Drawer
      title="Specify the dimensions of the merged lot"
      onClose={toggle}
      open={opened}  // Changed prop name from `open` to `visible`
      width={600}>
      <Form layout="vertical" form={form} onValuesChange={calculateAreaM2} onFinish={handleSubmit}>  
        <Row gutter={16}>
          <Col span="8">
            <Form.Item
              label="Width (mm)"
              name="LA"
              {...validationErrorsBag.getInputErrors("LA")}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span="8">
            <Form.Item
              label="Length (mm)"
              name="LU"
              {...validationErrorsBag.getInputErrors("LU")}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span="8">
            <Form.Item
              label="Pieces (N)"
              name="PZ"
              {...validationErrorsBag.getInputErrors("PZ")}
            >
              <InputNumber />
            </Form.Item>
          </Col>
          <Col span="8">
            <Form.Item
              label="m2"
              name="aream2"
            >
              <InputNumber readOnly disabled/>
            </Form.Item>
          </Col>
          <Col span="16">
            <LocationSelect
              onChange={form.setFieldsValue}
              idWarehouse={data?.idWarehouse}
            />
          </Col>
        </Row>
        <Form.Item
          label="Order reference"
          name="refOrd"
          {...validationErrorsBag.getInputErrors("refOrd")}
        >
          <TextArea />
        </Form.Item>
        <Row gutter={16}>
        <Col span={12}>
          <Button onClick={toggle} block>
            Close
          </Button> 
          </Col>    
          <Col span={12}>     
          <Button block type="primary" htmlType="submit" loading={loading} icon={<IconCheckbox/>}>
            Confirm
          </Button>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
};

export default MergeConfirm;
