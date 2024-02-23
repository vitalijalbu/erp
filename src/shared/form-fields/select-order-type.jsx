import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllOrderStatuses } from "@/api/orders";


const SelectOrderType = ({ name, value,disabled, onChange, status }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllOrderStatuses()
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
      status={status}
      onChange={onChange}
      loading={loading}
      options={data}
      disabled={disabled}
      placeholder="Select type"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectOrderType;
