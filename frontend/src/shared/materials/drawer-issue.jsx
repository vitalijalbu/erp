import React, { useState, useEffect } from "react";
import { getAllCustomers, getCustomerDestinations } from "@/api/bp";
import { useValidationErrors } from "@/hooks/validation-errors";
import { confirmMaterialIssue } from "@/api/stocks";
import {
  Button,
  Col,
  Drawer,
  Form,
  Input,
  Row,
  Select,
  Space,
  message,
} from "antd";
const { TextArea } = Input;
import { IconCheckbox, IconReceipt } from "@tabler/icons-react";

const DrawerIssue = ({ opened, toggle, reload }) => {
  const [form] = Form.useForm();
  const [submittable, setSubmittable] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [isFormChanged, setIsFormChanged] = useState(false);
  const [customers, setData] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const validationErrorsBag = useValidationErrors();
  const values = Form.useWatch([], form);
  useEffect(() => {
    form
      .validateFields({
        validateOnly: true,
      })
      .then(
        () => {
          setSubmittable(true);
        },
        () => {
          setSubmittable(false);
        }
      );
  }, [values]);

  
  useEffect(() => {
    getAllCustomers()
      .then(({ data }) => {
        setData(
          data.data.map((item) => ({
            label: item?.desc,
            value: item?.id,
          })) || []
        );
      })
  }, []);

  const handleCustomerChange = (warehouseId) => {
    getCustomerDestinations(warehouseId)
      .then(({ data }) => {
        setDestinations(
          data?.map((destination) => ({
            label: destination?.desc,
            value: destination?.IDdestination,
          })) || []
        );
      })
  };

  // Action Issue Materials
  const handleSubmit = async (values) => {
    setLoading(true);
    validationErrorsBag.clear();
    //console.log("✅ values-form: ", values);
    const { status, error, errorMsg, validationErrors } = await confirmMaterialIssue(values);
    if (error) {
      if(validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
      }
      message.error(errorMsg);
      setLoading(false);
    } else {
      message.success("Material shipment successfully confirmed");
      toggle();
      reload();
    }
  };



  return (
    <Drawer
      maskClosable={false}
      title="Confirm material issue"
      width={600}
      onClose={toggle}
      open={opened}
      extra={[
        <Space wrap>
        <Button onClick={toggle}>Close</Button>
        <Button
          type="primary"
          htmlType="submit"
          form="form-issue"
          icon={<IconCheckbox/>}
          loading={loading}
          disabled={!isFormChanged}
        >
          Confirm
        </Button>
      </Space>
      ]}
    >
      <Form disabled={loading} form={form} layout="vertical" onFinish={handleSubmit} name="form-issue" onValuesChange={() => setIsFormChanged(true)}>
        <Form.Item
          label="Select customer"
          name="idBP"
          {...validationErrorsBag.getInputErrors('idBP')}
        >
          <Select
            name="idBP"
            loading={loading}
            placeholder="Select customer"
            optionLabelProp="label"
            options={customers}
            onChange={handleCustomerChange}
            showSearch
            filterOption={(input, option) =>
              (option?.label?.toLowerCase() ?? '').toLowerCase().includes(input.toLowerCase())
            }
            allowClear
          />
        </Form.Item>
        <Form.Item
          label="Select destination"
          name="idDestination"
          {...validationErrorsBag.getInputErrors('idDestination')}
        >
          <Select
            name="idDestination"
            placeholder="Select customer destination"
            optionLabelProp="label"
            options={destinations}
            allowClear
          />
        </Form.Item>
        <Form.Item
          name="ordRef"
          label="Reference order to issue"
          {...validationErrorsBag.getInputErrors('ordRef')}
        >
          <Input
            placeholder="Insert reference order to issue"
            addonBefore={<IconReceipt />}
          />
        </Form.Item>
        <Form.Item name="deliveryNote" label="Notes" {...validationErrorsBag.getInputErrors('deliveryNote')}>
          <TextArea rows="6" placeholder="Insert delivery note number" />
        </Form.Item>
      </Form>
    </Drawer>
  );
};

export default DrawerIssue;
