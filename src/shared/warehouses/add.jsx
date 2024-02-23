import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Button,
  Drawer,
  Form,
  Input,
  Select,
  Space,
  message
} from "antd";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getAllCountries } from "@/api/countries";
import { createWarehouse } from "@/api/warehouses";

const WarehouseAdd = ({opened, onClose}) => {

    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const [loading, setLoading] = useState(false);
    const [countries, setCountries] = useState([]);
    const [isFormChanged, setIsFormChanged] = useState(false);


    useEffect(() => {
        (async() => {
            const {data, error} = await getAllCountries();
            setCountries(data.map((c) => ({
                label: c.desc,
                value: c.IDcountry
            })));
            if(error) {
                message.error("Error during countries loading");
            }
        })();
    }, []);

    useEffect(() => {
        if(opened) {
            form.resetFields();
            validationErrorsBag.clear();
        }
    }, [opened]);

    const handleUpdate = async (values) => {
        validationErrorsBag.clear();
        setLoading(true);
        var {status, error, validationErrors} = await createWarehouse(form.getFieldsValue());
        setLoading(false);

        if(error) {
            if(validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        }
        else {
            message.success("Warehouse saved succesfully");
            onClose();
        }
    };

    return (
        <Drawer
            title={"Add new Warehouse"}
            open={opened}
            width={600}
            onClose={onClose}
            extra={[
                <Space>
                <Button key="back" onClick={onClose}>
                  Close
                </Button>
                <Button
                  key="ok"
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!isFormChanged}
                  form="form-warehouse"
                >
                  Save
                </Button>
              </Space>
              ]}
        >
            <Form
                layout="vertical"
                form={form} 
                name="form-warehouse"
                onFinish={handleUpdate}
                disabled={loading}
                onValuesChange={() => setIsFormChanged(true)}
            >
                <Form.Item label="Country" name="IDcountry" {...validationErrorsBag.getInputErrors('IDcountry')}>
                    <Select options={countries} />
                </Form.Item>        
                <Form.Item label="Name" name="desc" {...validationErrorsBag.getInputErrors('desc')}>
                    <Input/>
                </Form.Item> 
            </Form>
        </Drawer>
    );
};

export default WarehouseAdd;
