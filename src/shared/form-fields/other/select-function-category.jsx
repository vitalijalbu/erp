import React, { useState, useEffect } from "react";
import { TreeSelect, message } from "antd";
import { getAllFunctionCategories } from "@/api/configurator/functions";

const SelectFunctionCategory = ({ name, value, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllFunctionCategories()
      .then(({ data, error }) => {
        if (!error) {
          const formattedData = formatData(data);
          setData(formattedData);
          setLoading(false);
        } else {
          message.error("An error occurred while fetching API");
          setLoading(false);
        }
      });
  }, []);

  const formatData = (categories) => {
    setLoading(true);
    return categories.map((category) => ({
      label: category.name,
      value: category.id,
      children: formatData(category.children),
    }));
  };

  return (
    <TreeSelect
      name={name}
      value={value}
      onChange={onChange}
      loading={loading}
      treeData={data}
      placeholder="Select parent category"
      showSearch
      allowClear
    />
  );
};

export default SelectFunctionCategory;
