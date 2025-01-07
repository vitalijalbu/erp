import React, { useState } from "react";
import { Select } from "antd";

const SelectListSeparator = (props) => {
  const { name, value, onChange, disabled } = props;

  const [loading, setLoading] = useState(false);

  //Static separators
  const data = [
    {
      value: ",",
      label: "Comma ,",
    },
    {
      value: ";",
      label: "Semicolons ;",
    },
  ];

  return (
    <Select
      name={name}
      options={data}
      value={value}
      onChange={onChange}
      //defaultValue={user?.company?.language ?? null}
      loading={loading}
      placeholder="Select list separator"
    />
  );
};

export default SelectListSeparator;
