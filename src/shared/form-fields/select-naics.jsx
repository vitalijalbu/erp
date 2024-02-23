import React, { useState, useEffect, useCallback } from "react";
import { Select, Spin, message } from "antd";
import { getAllNAICS } from "@/api/bp";


const SelectNaics = (props) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const loadCodes = useCallback(function(filters) {
    setLoading(true);
    getAllNAICS({columns: filters})
      .then(({ data, error }) => {
        if (!error) {
          setData(
            data?.data?.map((item) => ({
              label: item?.description,
              value: item?.id,
            })) || []
          );
        } else {
          message.error("An error occurred while fetching API");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  })

  useEffect(() => {
    
    // Initialize filter as null
    let filter = {};
    if(props.level) {
      filter['level'] = { 
        search: { 
          value: props.level, 
          operator: '=' 
        }
      };

      if(props.level > 1) {
        if(props.filter) {
          filter['parent_id'] = {
            search: { 
              value: props.filter, 
              operator: '=' 
            }
          }

          loadCodes(filter);
        }
        else {
          setData([]);
        }
      }
      else {
        loadCodes(filter);
      }
    }

    // API call with the constructed filter object
    
  }, [props.filter]);
  

  return (
    <Select
      key={props.key}
      name={props.name}
      disabled={props.disabled}
      value={props.value}
      onChange={props.onChange}
      loading={loading}
      options={data}
      listHeight={400}
      //notFoundContent={loading ?? <Spin size="small" />}
      placeholder="Select NAICS code"
      showSearch
      allowClear
   />
  );
};

export default SelectNaics;