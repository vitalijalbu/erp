import React, { useState, useEffect } from "react";
import { Select, message } from "antd";
import { getItemGroupsByCompany } from "@/api/items";
import { getSession } from "@/lib/api";

const SelectItemGroup = ({ name, value, disabled, onChange, withShared, keyName='id' }) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const user = getSession();

	useEffect(() => {
		if (user) {
			setLoading(true);
			getItemGroupsByCompany(user?.IDcompany, withShared).then(({ data, error }) => {
				if (!error) {
					setData(
						data?.map((group) => ({
							label: `${group?.item_group} - ${group?.group_desc}`,
							value: group[keyName],
						})) || []
					);
					setLoading(false);
				} else {
					message.error("An error occurred while fetching API");
					setLoading(false);
				}
			});
		}
	}, []);

	return (
		<Select
			name={name}
			value={value}
			onChange={onChange}
			disabled={disabled}
			loading={loading}
			options={data}
			placeholder="Select Product Type"
			optionFilterProp="children"
			filterOption={(input, option) =>
				(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
			}
			allowClear
			showSearch
		/>
	);
};

export default SelectItemGroup;
