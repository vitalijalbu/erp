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
const { TextArea } = Input;
import { useValidationErrors } from "@/hooks/validation-errors";
import { 
    getAllWarehouses, 
    createWarehouseLocation, 
    getWarehouseLocationTypes,
    updateWarehouseLocation
} from "@/api/warehouses";

const LocationAdd = ({opened, onClose, id, warehouseId}) => {

    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [warehouseLocationTypes, setWarehouseLocationTypes] = useState([]);
    const [isFormChanged, setIsFormChanged] = useState(false);

    useEffect(() => {
        (async() => {
            const warehouses = await getAllWarehouses();
            setWarehouses(warehouses.data.map((w) => ({
                label: w.country.desc + ' - ' + w.desc,
                value: w.IDwarehouse
            })));

            const warehousesLocTypes = await getWarehouseLocationTypes();
            setWarehouseLocationTypes(warehousesLocTypes.data.map((t) => ({
                label: `(evaluates ${t.evaluates ? 'YES' : 'NO'}) ${t.tname} - ${t.tdesc}`,
                value: t.IDwh_loc_Type
            })));
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
        if(id) {
            var {status, error, validationErrors} = await updateWarehouseLocation(
                id,
                warehouseId,
                form.getFieldsValue()
            );
        }
        else {
            if(!form.getFieldValue('IDwarehouse')) {
                validationErrorsBag.setValidationErrors({
                    'IDwarehouse': ['Required Field']
                });
                return false;
            }
            var {status, error, validationErrors} = await createWarehouseLocation(
                form.getFieldValue('IDwarehouse'),
                form.getFieldsValue()
            );
        }
        setLoading(false);

        if(error) {
            if(validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        }
        else {
            message.success("Location saved succesfully");
            onClose();
        }
    };

    return (
        <Drawer
            title={id ? "Change warehouse location type" : "Add new warehouse location"}
            open={opened}
            onClose={onClose}
            width={600}
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
                  form="form-location"
                >
                  Save
                </Button>
              </Space>
              ]}
        >
            <Form
                layout="vertical"
                name="form-location"
                form={form} 
                onFinish={handleUpdate}
                disabled={loading}
                onValuesChange={() => setIsFormChanged(true)}
            >
                {
                    id == undefined || id == null ? <>
                    <Form.Item label="Warehouse" name="IDwarehouse" {...validationErrorsBag.getInputErrors('IDwarehouse')}>
                        <Select options={warehouses} />
                    </Form.Item>        
                    <Form.Item label="Name" name="desc" {...validationErrorsBag.getInputErrors('desc')}>
                        <Input/>
                    </Form.Item> 
                    <Form.Item label="Notes" name="note" {...validationErrorsBag.getInputErrors('note')}>
                        <TextArea/>
                    </Form.Item> 
                    </>
                    :
                    <>
                        <Form.Item label="Location Type" name="IDwh_loc_Type" {...validationErrorsBag.getInputErrors('IDwh_loc_Type')}>
                            <Select options={warehouseLocationTypes} />
                        </Form.Item> 
                    </>
                }
            </Form>
        </Drawer>
    );
};

export default LocationAdd;
