import React, { useState, useEffect } from "react";
import { Select, Button, message} from "antd";
import { IconListCheck, } from "@tabler/icons-react";
const SelectWithModal = ({
  placeholder,
  extras,
  onChange,
  value,
  toggleModal,
  data,
}) => {
  const [loading, setLoading] = useState(false);
  const [localValue, setLocalValue] = useState(null);
 
  const handleClear = () => {
   onChange(null)
    setLocalValue(null)
  }

  const handleChange = (valueSelect) => {
    if (!valueSelect) return
    const {value}=valueSelect
    onChange(value)
  }

  const [dataList, setDataList] = useState([])
  useEffect(() => {
    if (data?.length === 0) return
    // create new array of objects with label and value the field names are item and item_desc respectively
    const newData = data?.map((item) => ({
      label: item['item_desc'],
      value: item['IDitem'],
    }))
    setDataList(newData)
  }, [data])
  
  return (
    <>
      <Select
        value={{value}}
        listHeight={400}
        onChange={handleChange}
        loading={loading}
        options={dataList}
        placeholder={placeholder}
        filterOption={(input, option) => (option?.label.toLowerCase() ?? "").includes(input.toLowerCase())}
        allowClear
        showSearch
        onClear={handleClear}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Button block icon={<IconListCheck />} onClick={toggleModal} className="mt-1">
              Show more
            </Button>
          </>
        )}
      />

      {extras}
    </>
  );
};

export default SelectWithModal;