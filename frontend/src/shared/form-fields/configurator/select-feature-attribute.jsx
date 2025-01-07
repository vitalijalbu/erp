import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllFeatureAttributes } from "@/api/configurator/features";
import { parseBool } from "@/hooks/formatter";

const SelectFeatureAttribute = ({ name, options, disabledData, value, disabled, onChange, defaultValue }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if(options){
      setData(mapData(options))
    }
    else{
      fetchData();
    }

  }, [disabledData]);

  const mapData = (data) => {
      return data.map((item) => ({
        label: item?.name,
        value: item?.id,
        disabled: parseBool(item?.multiple) ? false : _.includes(disabledData, item?.id)
      }))
  }
  const fetchData = async () => {
    setLoading(true);
    try {
        // Fetch data from the API
        const { data, error } = await getAllFeatureAttributes();

        if (!error) {
          setData(mapData(data));
        } else {
          message.error("An error occurred while fetching API");
        }
      }
      catch(e){
        console.warn(e)
    } finally {
      setLoading(false);
    }
  };

  return (
    <Select
      name={name}
      disabled={disabled}
      value={value} // Set value to undefined when disabled
      defaultValue={defaultValue}
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select attribute"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
      allowClear
      showSearch
    />
  );
};

export default SelectFeatureAttribute;
