import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllWeightsUM } from "@/api/items";

const SelectUMWeight = ({ name, value, onChange }) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	useEffect(() => {
		setLoading(true);
		getAllWeightsUM().then(({ data, error }) => {
			if (!error) {
				setData(
					data?.data.map((um) => ({
						label: um.id + " - " + um.label,
						value: um.id,
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
			placeholder='Select the unit of measure'
			optionFilterProp='children'
			filterOption={(input, option) =>
				(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
			}
			allowClear
			showSearch
		/>
	);
};

export default SelectUMWeight;
