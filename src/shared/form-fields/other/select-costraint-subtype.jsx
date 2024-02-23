import React from "react";
import { Select } from "antd";

const SelectConstraintSubtype = (props) => {
	return (
		<Select
			name={props?.name ?? "subtype"}
			value={props?.value}
			onChange={props?.onChange}
			loading={props?.loading}
			disabled={props.disabled}
			allowClear
			options={[
				{ value: "activation", label: "Activation" },
				{ value: "validation", label: "Validation" },
				{ value: "value", label: "Value" },
				{ value: "dataset", label: "Dataset" },
			]}
		/>
	);
};

export default SelectConstraintSubtype;
