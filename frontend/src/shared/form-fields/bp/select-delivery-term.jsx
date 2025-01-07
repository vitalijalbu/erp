import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllDeliveryTerms } from "@/api/globals/index";


const SelectDeliveryTerm = (props) => {
  const {name, value, onChange, disabled} = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);


  useEffect(() => {
      setLoading(true);
      getAllDeliveryTerms()
        .then(({ data, error }) => {
          if (!error) {
            setData(
              data?.data?.map((item) => ({
                label: item.label,
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
      disabled={disabled}
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select delivery term"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectDeliveryTerm;