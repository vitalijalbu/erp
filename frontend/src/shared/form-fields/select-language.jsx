import React, { useState, useEffect, useCallback } from "react";
import { Select, message } from "antd";
import { getAllLanguages } from "@/api/globals/index";
import { getSession } from "@/lib/api";

const SelectLanguage = (props) => {
  const { name, value, onChange, disabled, withShared } = props;
  const user = getSession();
  const defaultValue = user?.company?.language;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllLanguages().then(({ data, error }) => {
      if (!error) {
        setData(
          data?.map((lang) => ({
            label: lang?.name,
            value: lang?.langAlpha2,
          })) || []
        );
        setLoading(false);
      } else {
        message.error("An error occurred while fetching API");
        setLoading(false);
      }
    });
  }, []);


  useEffect(() => {
    if (value === undefined && !disabled) {
      onChange(defaultValue);
    }
  }, []);
  
  


  return (
    <Select
      name={name}
      options={data}
      value={value}
      onChange={onChange}
      //defaultValue={user?.company?.language ?? null}
      loading={loading}
      placeholder="Select language"
      optionFilterProp="label"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
      allowClear
      showSearch
    />
  );
};

export default SelectLanguage;
