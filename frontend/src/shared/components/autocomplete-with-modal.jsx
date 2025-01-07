import React, { useState, useEffect } from "react";
import { Select, Button, message, Divider, Row, Col, Space, Tooltip, AutoComplete } from "antd";
import { IconSearch } from "@tabler/icons-react";
import _ from "lodash";
const AutocompleteWithModal = ({
	name,
	value,
	placeHolder,
	onChange,
	onSearch,
	options,
	extras,
	disabled,
	disabledOptions,
	onTogglePopUp,
	optionValue = "id",
	optionLabel,
	groupBy,
}) => {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState([]);
	const [localValue, setLocalValue] = useState(null);
	const [popup, setPopup] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);

	const togglePopup = () => {
		setPopup(!popup);
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
	
	const mapOptions = (data) => {
		return _.map(data, (o) => {
			return {
				label: createItemLabel(o),
				value: o[optionValue],
				disabled: disabledOptions ? disabledOptions.includes(o?.id) : false,
			};
		});
	}

	const groupOptions = (data) => {
		let localData  = _.map(_.groupBy(data, groupBy), (v, k) => {
			return {
				label: k,
				options: mapOptions(v)
			};
		});
		return localData;
	};

	useEffect(() => {
		if (options) {
			if(groupBy) {
				setData(groupOptions(options));
			}
			else{
				setData(mapOptions(options));
			}
		}
	}, [options]);

	const handleClear = () => {
		setLocalValue(null);
		onChange(null);
	};

	const handleChange = (value) => {
		setLocalValue(value);
		onChange(value);
	};

	return (
		<>
			<Space.Compact className="flex w-100">
				<AutoComplete
					name={name}
					value={localValue}
					loading={loading}
					options={data || []}
					placeholder={placeHolder || "Select Item"}
					disabled={disabled}
					onClear={handleClear}
					onChange={(value) => handleChange(value)}
					onSearch={(val) => onSearch(val)}
				/>
				<Tooltip
					placement="top"
					title="Table Look-up"
					mouseEnterDelay={0.5}
				>
					<Button
						icon={<IconSearch />}
						onClick={onTogglePopUp}
					></Button>
				</Tooltip>
			</Space.Compact>

			{extras}
		</>
	);
};

export default AutocompleteWithModal;
