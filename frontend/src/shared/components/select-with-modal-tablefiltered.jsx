import React, { useState, useEffect, useRef } from "react";
import { Select, Button, message, Modal, Table, Space, Tooltip } from "antd";
import { IconCheckbox, IconListCheck, IconSearch } from "@tabler/icons-react";
import _ from "lodash";
import TableFiltered from "./table-filtered-product.jsx";
const SelectWithModalTablefiltered = ({
	name,
	value,
	placeHolder,
	onChange,
	onSelect,
	className,
	autoFocus,
	focusValue,
	id,
	callBack,
	filter,
	disabled,
	options,
	title,
	onFocus
}) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [localValue, setLocalValue] = useState(null);
	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);
	const [modalColumns, setModalColumns] = useState([]);
	const [tableData, setTableData] = useState([]);
	const [type, setType] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	function manipulateColumns(optionsParam) {
		let formattedData = [];
		if (optionsParam.type == "list") {
			setType("list");
			formattedData = _.map(optionsParam.data, (value, key) => {
				return {
					label: value,
					value: key,
					// disabled: disabledOptions ? disabledOptions.includes(item?.id) : false,
				};
			});
		} else if (optionsParam.type == "table") {
			setType("table");
			formattedData = [];
			optionsParam?.data?.forEach((element) => {
				let keysData = Object?.keys(element);
				if (keysData.length > 1) {
					formattedData.push({
						label: element[keysData[1]],
						value: element[keysData[0]],
					});
				} else {
					formattedData.push({
						label: element[keysData[0]],
						value: element[keysData[0]],
					});
				}
			});
		}
		// Extract columns based on data structure
		const columns = [];
		options.columns?.forEach((element) => {
			columns?.push({
				title: element["name"],
				dataIndex: element["name"],
				key: element["name"],
				type: element["type"],
			});
		});
		setData(formattedData);
		setModalColumns(columns);
		setTableData(options.data);
	}

	const handleFetch = () => {
		setLoading(true);
		callBack(filter)
			.then(({ data }) => {
				manipulateColumns(data);
			})
			.catch((error) => {
				message.error("An error occurred while fetching API");
			})
			.finally(() => setLoading(false));
	};

	useEffect(() => {
		if (callBack) {
			handleFetch();
		}

		if (!callBack && options) {
			manipulateColumns(options);
		}
	}, []);

	useEffect(() => {
		if (value) {
			setLocalValue(value);
		}
	}, [value]);

	const handleClear = () => {
		setLocalValue(null);
		onChange(null);
	};

	const handleChange = (value) => {
		setLocalValue(value);
		onChange(value);
	};

	const handleSelection = () => {
		onChange(selected);
		togglePopup();
	};

	return (
		<>
			<Space.Compact style={{ width: "100%" }}>
				<Select
					name={name}
					value={localValue}
					loading={loading}
					id={id}
					autoFocus={autoFocus}
					className={className}
					options={data || []}
					placeholder={placeHolder || "Select Item"}
					optionFilterProp='children'
					filterOption={(input, option) =>
						(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
					}
					allowClear
					showSearch
					disabled={disabled}
					onClear={handleClear}
					onChange={(value) => { handleChange(value)}}
					onFocus={(e) => {
						if(onFocus) {
							onFocus(e);
						}
						if(callBack) {
							handleFetch()
						}
					}}
				/>
				{popup && (
					<Modal
						open={popup}
						onCancel={togglePopup}
						title={title}
						onSelect={handleSelection}
						width='90%'
						transitionName='ant-modal-slide-up'
						className='modal-fullscreen'
						centered
						maskClosable={false}
						footer={[
							<Button onClick={togglePopup}>Close</Button>,
							<Button
								disabled={!selected}
								type='primary'
								htmlType='submit'
								icon={<IconCheckbox />}
								onClick={() => handleSelection(selected)}
							>
								Select
							</Button>,
						]}
					>
						<TableFiltered
							dataSource={tableData}
							columns={modalColumns}
							selectable={true}
							onSelect={setSelected}
						/>
					</Modal>
				)}
				{type === "table" && (
					<Tooltip
						placement='top'
						title='Table Look-up'
						mouseEnterDelay={0.5}
					>
						<Button
							// block
							icon={<IconSearch />}
							onClick={() => togglePopup()}
							disabled={disabled}
						>
							{/* Show more */}
						</Button>
					</Tooltip>
				)}
			</Space.Compact>
		</>
	);
};

export default SelectWithModalTablefiltered;
