import React, { useState, useEffect, useCallback } from "react";
import { Select } from "antd";
import { getAllCompanyEmployees } from "@/api/companies";

const SelectEmployee = (props) => {
  const { name, value, onChange, disabled, companyId, withShared } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if(companyId !== undefined){
      setLoading(true);
      getAllCompanyEmployees(companyId)
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.map((item) => ({
              label: item?.name,
              value: item?.id,
            })) || [],
          );
          setLoading(false);
        } else {
          console.log("An error occurred while fetching API");
          setLoading(false);
        }
      });
    }
  }, [companyId]);

  return (
    <Select
      name={name}
      options={data}
      value={value}
      onChange={onChange}
      //defaultValue={user?.company?.language ?? null}
      loading={loading}
      placeholder="Select employee"
      optionFilterProp="label"
      filterOption={(input, option) =>
        (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
      }
      allowClear
      showSearch
    />
  );
};

export default SelectEmployee;
