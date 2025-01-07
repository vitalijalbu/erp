import React, { useState, useEffect } from "react";
import { Select, Space, Form } from "antd";
import { getAllWarehouses } from "@/api/warehouses";
import { getSession } from "@/lib/api";

const WarehouseSelect = ({ onChange, validationErrors }) => {
    const user = getSession();
    
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [warehouses, setWarehouses] = useState([]);
    const [locations, setLocations] = useState([]);

    const validationErrorsBag = validationErrors;

    useEffect(() => {
        setLoading(true);
        getAllWarehouses()
            .then(({ data }) => {
                const ws = data?.map((item) => ({
                    label: item?.desc,
                    value: item?.IDwarehouse,
                    locations: item?.warehouse_locations || [],
                })) || [];

                setWarehouses(ws);

                form.setFieldValue(
                    'idWarehouse',
                    user?.IDwarehouseUserDef
                );
                handleWarehouseChange(form.getFieldValue('idWarehouse'));

                if(user?.IDwarehouseUserDef) {
                    const selectedWarehouse = ws.find(
                        (warehouse) => warehouse.value == user.IDwarehouseUserDef
                    );
                    setLocations(selectedWarehouse.locations);
                    form.setFieldValue(
                        'idWarehouseLocation',
                        user?.default_warehouse_location_id
                    );
                    handleLocationChange(form.getFieldValue('idWarehouseLocation'));
                }

            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    const handleWarehouseChange = (warehouseId) => {
    //form.setFieldsValue({ idWarehouseLocation: '' }); // Set location value to undefined
        onChange({
            idWarehouse: warehouseId,
            idWarehouseLocation: null,
        });
        form.setFieldValue('idWarehouseLocation', null);
        const selectedWarehouse = warehouses.find(
            (warehouse) => warehouse.value == warehouseId
        );
        
        if (selectedWarehouse) {
            setLocations(selectedWarehouse.locations);
        } else {
            setLocations([]); // Clear locations if no warehouse is selected
        }
    };

    const handleLocationChange = (locationId) => {
        const warehouseId = form.getFieldValue("idWarehouseLocation");
        onChange({
            idWarehouseLocation: locationId,
        });
    };

  
    return (
        <>
        <Form.Item 
            label="Select warehouse" 
            name="idWarehouse"
            {...validationErrorsBag.getInputErrors("idWarehouse")}
        >
            <Select
                name="idWarehouse"
                loading={loading}
                placeholder="Select warehouse"
                options={warehouses}
                //value={{ value: Number(user?.IDwarehouseUserDef) }}
                onChange={handleWarehouseChange}
                onClear={handleWarehouseChange}
                allowClear
            />
        </Form.Item>
        <Form.Item 
            label="Select location" 
            name="idWarehouseLocation"
            {...validationErrorsBag.getInputErrors("idWarehouseLocation")}
        >
            <Select
                name="idWarehouseLocation"
                loading={loading}
                placeholder="Select location"
                options={locations.map((location) => ({
                    label: location.desc,
                    value: location.IDlocation,
                }))}
                onChange={handleLocationChange}
                onClear={handleLocationChange}
                allowClear
            />
        </Form.Item>
        </>
    );
};

export default WarehouseSelect;
