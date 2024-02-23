import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllOrderTypes } from "@/api/orders";


const SelectTaxCalculation = ({ name, value,disabled, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllOrderTypes()
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data.map((item) => ({
              label: item?.label,
              value: item?.id
            })) || []
          );
          setLoading(false);
        } else {
          message.error("An error occurred while fetching API");
          setLoading(false);
        }
      });
  }, []);
  

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      loading={loading}
      options={data}
      disabled={disabled}
      placeholder="Select order type"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectTaxCalculation;
