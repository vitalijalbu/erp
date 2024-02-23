import React, { useState, useEffect, useCallback } from "react";
import { Select, Row, Col, Form, message } from "antd";
import { getAllClassifications } from "@/api/items";
import { parseBool } from "@/hooks/formatter";

const SelectItemClassification = (props) => {
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);
	const [dataL1, setDataL1] = useState([]);
	const [dataL2, setDataL2] = useState([]);

	//console.log("selected", selected);

	const filtersL1 = { columns: { level: { search: { value: 1 } } } };
	const filtersL2 = {
		columns: {
			id: { search: { value: selected?.pivots || [], operator: "in" } },
			level: { search: { value: 2 } },
		},
	};

	// Memoized fetchData function using useCallback to avoid unnecessary re-creation
	const fetchData = useCallback(async (filters, setDataFunction) => {
		setLoading(true);
		try {
			const { data, error } = await getAllClassifications(filters);
			if (!error) {
				//console.log(data);
				setDataFunction(
					data?.data.map((item) => ({
						label: item?.label,
						value: item?.id,
						allow_owner: parseBool(item?.allow_owner) || 0,
						require_level_2: parseBool(item?.require_level_2) || 0,
						pivots: item?.pivot ?? [],
					})) || []
				);
			} else {
				message.error("An error occurred while fetching API");
			}
		} finally {
			setLoading(false);
		}
	}, []);

	// Initial data fetch for the first level on component mount
	useEffect(() => {
		fetchData(filtersL1, setDataL1);
		setSelected(props?.form?.getFieldValue("classification_l1"));
	}, []);

	// Fetch data for the second level when the first level option changes
	useEffect(() => {
		if (selected) {
			fetchData(filtersL2, setDataL2);
		}
	}, [selected]);

	// Handle change for the first level dropdown
	const handleChangeL1 = async (value, option) => {
		setSelected(option);

		// Reset the second level value
		props?.form.setFieldValue("classification_l2", null);

		// Trigger the parent's onChange if provided
		if (props?.onChange) {
			props.onChange(value, option);
		}
	};

	// Handle change for the second level dropdown
	const handleChangeL2 = (value, option) => {
		// Trigger the parent's onRequire and onChange if provided
		if (props?.onRequire && option?.require_level_2 !== undefined) {
			props.onRequire(option?.require_level_2);
		}

		//props?.onChange(value, option);
		props?.onRequiredBP(option?.allow_owner);
		if (option?.allow_owner === 0) {
			props?.form.setFieldValue("owner", null);
			console.log("changing-owner...", option?.allow_owner);
		}
		//console.log("props.onRequiredBP", option?.allow_owner);
	};

	return (
		<Row gutter='16'>
			<Col span='12'>
				<Form.Item
					label='Classification Level 1'
					name='classification_l1'
					{...props?.errors?.getInputErrors("classification_l1")}
				>
					<Select
						name='classification_l1'
						onChange={handleChangeL1}
						loading={loading}
						options={dataL1}
						placeholder='Select the unit of measure'
						optionFilterProp='children'
						filterOption={(input, option) =>
							(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
						}
						allowClear
						showSearch
					/>
				</Form.Item>
			</Col>
			<Col span='12'>
				<Form.Item
					label='Classification Level 2'
					name='classification_l2'
					{...props?.errors?.getInputErrors("classification_l2")}
				>
					<Select
						name='classification_l1'
						disabled={!selected}
						onChange={handleChangeL2}
						loading={loading}
						options={dataL2}
						placeholder='Select the unit of measure'
						optionFilterProp='children'
						filterOption={(input, option) =>
							(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
						}
						allowClear
						showSearch
					/>
				</Form.Item>
			</Col>
		</Row>
	);
};

export default SelectItemClassification;
