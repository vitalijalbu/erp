import React, { useState, useEffect, useCallback } from "react";
import { Select } from "antd";
import { getAllTimezones } from "@/api/globals";
import { getSession } from "@/lib/api";



const SelectTimezone = (props) => {
  const { name, value, onChange, disabled, companyId, withShared } = props;
  const user = getSession();
  const defaultValue = user?.company?.language;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllTimezones()
    .then(({ data, error }) => {
      if (!error) {
        setData(
            Object.entries(data).map(([tz, tzLabel]) => ({
              label: tzLabel,
              value: tz,
          })) || []
        );
        setLoading(false);
      } else {
        console.log("An error occurred while fetching API");
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
      placeholder="Select timezone"
      optionFilterProp="label"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
      allowClear
      showSearch
    />
  );
};

export default SelectTimezone;
