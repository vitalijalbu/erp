import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllContactTypes } from "@/api/contacts";


const SelectContactType = (props) => {
  const {name, value, onChange, withShared} = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);


  useEffect(() => {
      setLoading(true);
      getAllContactTypes()
        .then(({ data, error }) => {
          if (!error) {
            setData(
              data?.data?.map((item) => ({
                label: item.name,
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
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select contact type"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
   />
  );
};

export default SelectContactType;