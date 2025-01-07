import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllCompanies } from "@/api/companies";


const SelectCompany = ({ name, value, onChange, withShared }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
    getAllCompanies(withShared)
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.map((company) => ({
              label: company?.desc,
              value: company?.IDcompany,
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
      placeholder="Select company"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
       //allowClear
      showSearch
    />
  );
};

export default SelectCompany;