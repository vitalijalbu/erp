import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllCustomers } from "@/api/bp";


const CustomerSelect = ({ name, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllCustomers()
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data.map((item) => ({
              label: item?.desc,
              value: item?.id,
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
      placeholder="Select customer"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default CustomerSelect;
