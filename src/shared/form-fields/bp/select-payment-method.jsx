import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllPaymentMethods } from "@/api/globals/payments";

const SelectPaymentMethod = (props) => {
  const { name, value, onChange, disabled } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllPaymentMethods()
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data?.map((item) => ({
              label: item.label,
              value: item?.code
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
      disabled={disabled}
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select payment method"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
    />
  );
};

export default SelectPaymentMethod;
