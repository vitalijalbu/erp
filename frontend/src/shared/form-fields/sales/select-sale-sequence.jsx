import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllSalesSequences } from "@/api/sales/sequences";


const SelectSaleSequence = ({ name, value,disabled, onChange, isLoading, defaultField, onSetDefault}) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [defaultValue, setDefaultValue] = useState(null);

  useEffect(() => {
    setLoading(true);
    if(!isLoading){
      getAllSalesSequences()
        .then(({ data, error }) => {
          setDefaultValue(_.find(data.data, (o) => o[defaultField + '_default'])?.id)
          if (!error) {
            setData(
              data?.data?.map((item) => ({
                label: item?.name,
                value: item?.id
              })) || []
            );
            setLoading(false);
          } else {
            message.error("An error occurred while fetching API");
            setLoading(false);
          }
        });
    }
  }, [isLoading]);
 

  useEffect(()=> {
    if(!value)
    onSetDefault(defaultValue)
  },[defaultValue])

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      loading={loading}
      options={data}
      disabled={disabled}
      placeholder="Select sequence"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default SelectSaleSequence;
