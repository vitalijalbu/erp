import React, { useState, useEffect } from "react";
import { Select, message, Form } from "antd";
import { getLocationsById } from "@/api/warehouses";

const LocationSelect = ({ onChange, idWarehouse }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    setLoading(true);
    getLocationsById(idWarehouse)
      .then(({ data, error }) => {
        if (!error) {
        setLocations(
          data.map((item) => ({
            label: item?.location.description,
            value: item?.location.id,
          })) || []
        );
        setLoading(false);
      } else {
        message.error("An error occurred while fetching API");
        setLoading(false);
      }
    });
}, []);


  const handleLocationChange = (locationId) => {
    //const warehouseId = form.getFieldValue("idWarehouse");
    /*onChange({
      //idWarehouse: warehouseId,
      idWarehouseLocation: locationId,
    });*/
  };

  return (
    <>
      <Form.Item label="Select location" name="idWarehouseLocation" rules={[{ required: true }]}>
        <Select
          name="idWarehouseLocation"
          loading={loading}
          preserve={false}
          placeholder="Select location"
          options={locations}
          onChange={handleLocationChange}
          onClear={handleLocationChange}
          allowClear
        />
      </Form.Item>
    </>
  );
};

export default LocationSelect;
