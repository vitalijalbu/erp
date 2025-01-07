import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllCompanyWorkcenters } from "@/api/companies";


const SelectCompanyWorkcenter = (props) => {
  const { name, value, onChange, disabled, withShared, companyId } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    if(companyId !== undefined){
      setLoading(true);
      getAllCompanyWorkcenters(companyId)
        .then(({ data, error }) => {
          if (!error) {
            setData(
              data?.map((item) => ({
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
  }, [companyId]);

  return (
    <Select
      name={name}
      value={value}
      onChange={onChange}
      loading={loading}
      options={data}
      placeholder="Select workcenter"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
       //allowClear
      showSearch
    />
  );
};

export default SelectCompanyWorkcenter;