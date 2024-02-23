import React, { useState, useEffect } from "react";
import { Select, message } from "antd";


const DataSelector = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  useEffect(() => {
    setLoading(true);
          
    getAvailableFeatures(filters ?? null)
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data.map((item) => ({
              label: `${item?.id} - ${item?.label}`,
              value: item?.id,
            })) || []
            );
          setLoading(false);
        } else {
          message.error("An error occurred while fetching API");
          setLoading(false);
        }
      });
  }, [reload]);
  
  /* <DataSelector apiName="getAvailableFeatures" apiPath="@/api/configurator/features" disabled={disabled_features} reload={reloadAction} /> */

  return (
    <Select
      value={props.value}
      onChange={props.onChange}
      loading={loading}
      options={props.data}
      placeholder="Select feature"
      optionFilterProp="children"
      filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
      allowClear
      showSearch
   />
  );
};

export default DataSelector;

