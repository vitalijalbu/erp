import React, { useState, useEffect } from "react";
import { Input } from "antd";
const InputDebounce = (props) => {
  const { onChange, ...otherProps } = props;

  const [inputTimeout, setInputTimeout] = useState(null);

  useEffect(() => () => clearTimeout(inputTimeout), [inputTimeout]);

  const inputOnChange = (value) => {
    if (inputTimeout) clearTimeout(inputTimeout);
    setInputTimeout(
      setTimeout(() => {
        if (onChange) onChange(value);
      }, 200)
    );
  };

  return (
    <Input {...otherProps} onChange={(e) => inputOnChange(e.target.value)} />
  );
};

export default InputDebounce;
