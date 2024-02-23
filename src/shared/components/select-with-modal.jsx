import React, { useState, useEffect } from "react";
import {
	Select,
	Button,
	message,
	Divider,
	Row,
	Col,
	Space,
	Tooltip,
	Spin,
} from "antd";
import { IconSearch } from "@tabler/icons-react";
import _, { isArray } from "lodash";
const SelectWithModal = ({
	name,
	value,
	placeHolder,
	onChange,
	callBack,
	options,
	filter,
	mode,
	extras,
	disabled,
	disabledOptions,
	onTogglePopUp,
	optionValue = "id",
	optionLabel,
	status = null,
	autofocus,
}) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [localValue, setLocalValue] = useState(null);
	const [popup, setPopup] = useState(false);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const noOptions = () => {
		if (loading) {
			return (
				<div className='flex p-1'>
					<Space>
						<Spin size='small' /> <span>Loading Options...</span>
					</Space>
				</div>
			);
		}
	};

	const createItemLabel = (item) => {
		if (typeof optionLabel === "string") {
			return item[optionLabel];
		} else if (typeof optionLabel === "object") {
			let labels = [];
			_.each(optionLabel, (el) => {
				labels.push(item[el]);
			});
			return labels.join(" - ");
		} else if (typeof optionLabel === "function") {
			return optionLabel(item);
		}
	};

	const mapOptions = (opts) => {
		return opts.map((item) => ({
			label: createItemLabel(item),
			value: item[optionValue],
			disabled: disabledOptions ? disabledOptions.includes(item?.id) : false,
		}));
	};

	const handleFetch = () => {
		setLoading(true);
		callBack(filter)
			.then(({ data }) => {
				setData(mapOptions(data.data));
			})
			.then(() => {
				// console.log(value && !_.find(data, (o) => o.value === value));
				// if (value && !_.find(data, (o) => o.value === value)) {
				// 	setLocalValue(null);
				// 	onChange(null);
				// }
			})
			.catch((error) => {
				message.error("An error occurred while fetching API");
			})
			.finally(() => {
				setTimeout(() => {
					setLoading(false);
				}, 500);
				// console.log(
				// 	value,
				// 	_.find(data, (o) => o.value === value)
				// );
			});
	};

	useEffect(() => {
		if (callBack) {
			handleFetch();
		}

		if (!callBack && options) {
			setData(mapOptions(options));
		}
	}, []);

	useEffect(() => {
		if (!callBack && options) {
			setData(mapOptions(options));
		}
	}, [options]);

	useEffect(() => {
		if (isArray(value)) {
			const idArray = data.map((el) => el.value);
			const array = value?.filter((el) => idArray.includes(el));
			setLocalValue(array);
		} else if (
			value &&
			data.length > 0 &&
			!_.find(data, (o) => o.value === value)
		) {
			setLocalValue(null);
			onChange(null);
		}
	}, [data]);

	useEffect(() => {
		if (value) {
			if (!_.find(data, (o) => o.value === value)) {
				if (!callBack && options) {
					setData(mapOptions(options));
				} else {
					handleFetch();
				}
			}
		}
		setLocalValue(value);
	}, [value]);

	const handleClear = () => {
		setLocalValue(null);
		onChange(null);
	};

	const handleChange = (value) => {
		// handleFetch();
		setLocalValue(value);
		onChange(value);
	};

	return (
		<>
			<Space.Compact style={{ width: "100%" }}>
				<Select
					name={name}
					value={localValue}
					loading={loading}
					options={data || []}
					placeholder={placeHolder || "Select Item"}
					optionFilterProp='children'
					filterOption={(input, option) =>
						(option?.label.toLowerCase() ?? "").includes(input.toLowerCase())
					}
					allowClear
					showSearch
					mode={mode}
					disabled={disabled}
					onClear={handleClear}
					onChange={(value) => handleChange(value)}
					onFocus={callBack ? handleFetch : null}
					notFoundContent={noOptions()}
					status={status}
					autoFocus={autofocus}
				/>
				<Tooltip
					placement='top'
					title='Table Look-up'
					mouseEnterDelay={0.5}
				>
					<Button
						// block
						icon={<IconSearch />}
						onClick={onTogglePopUp}
						disabled={disabled}
					>
						{/* Show more */}
					</Button>
				</Tooltip>
			</Space.Compact>

			{extras}
		</>
	);
};

export default SelectWithModal;
