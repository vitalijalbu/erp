import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllBPCategories } from "@/api/bp";


const SelectBPCategory = ({name, value, disabled, onChange}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllBPCategories()
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.map((item) => ({
              label: item?.description,
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
      disabled={disabled}
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select bp category"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectBPCategory;