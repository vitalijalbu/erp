import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllLanguagesDoc } from "@/api/globals/index";


const SelectLanguageDoc = ({ name, value, disabled, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllLanguagesDoc()
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data.map((item) => ({
              label: item?.label,
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
      placeholder="Select order type"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectLanguageDoc;
