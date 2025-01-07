import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getAllCurrencies } from "@/api/bp";
import { getSession } from "@/lib/api";

const SelectCurrency = ({ name, value, disabled, defaultVal, options, onChange, setDefault }) => {
	const user = getSession();
	const defaultValue = defaultVal || user?.company?.curr;

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);

	useEffect(() => {
		setLoading(true);
		if (!options) {
			getAllCurrencies().then(({ data, error }) => {
				if (!error) {
					setData(
						data?.map((curr) => ({
							label: curr?.id,
							value: curr?.id,
						})) || []
					);
					setLoading(false);
				} else {
					message.error("An error occurred while fetching API");
					setLoading(false);
				}
			});
		} else {
			setData(
				options?.map((curr) => ({
					label: curr?.id,
					value: curr?.id,
				})) || []
			);
			setLoading(false);
		}
	}, [options]);

	useEffect(() => {
		// check value only for undefined because default value in creation, null can come from db and doesn't have to be overrided
		if (value === undefined && setDefault && _.isFunction(setDefault)) {
			// onChange in this case will trigger the form touched, is needed a custom event to set the field value
			setDefault(defaultValue);
		}
	}, []);

	return (
		<Select
			name={name}
			disabled={disabled}
			value={value} // Set value to undefined when disabled
			onChange={onChange}
			loading={loading}
			options={data}
			placeholder="Select currency"
			filterOption={(input, option) =>
				(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
			}
			allowClear
			showSearch
		/>
	);
};

export default SelectCurrency;
