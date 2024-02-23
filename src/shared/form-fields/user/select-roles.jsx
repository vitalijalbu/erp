import React, { useState, useEffect } from "react";
import { Select } from "antd";
import { getAllRoles } from "@/api/users";

const SelectRoles = (props) => {
  const { name, value, onChange, disabled } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllRoles()
    .then(({ data, error }) => {
      if (!error) {
        setData(
          data?.data.map((item) => ({
            label: item?.label,
            value: item?.id
          })) || []
        );
        setLoading(false);
      } else {
        console.log("An error occurred while fetching API");
        setLoading(false);
      }
    });
  }, []);



  return (
    <Select
      mode="multiple"
      name={name}
      options={data}
      value={value}
      onChange={onChange}
      //defaultValue={user?.company?.language ?? null}
      loading={loading}
      placeholder="Select roles"
      optionFilterProp="label"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
      allowClear
      showSearch
    />
  );
};

export default SelectRoles;
