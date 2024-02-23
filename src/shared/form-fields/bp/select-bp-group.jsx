import React, { useEffect, useState } from "react";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllBPGroups } from "@/api/bp";
import TableGroups from "@/shared/workcenters/table-workcenters";
import BpGroupModal from "@/shared/business-partners/bp-group-modal";

const SelectBPGroup = (props) => {
	const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);
	const [localValue, setLocalValue] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllBPGroups;

	const handleOnChange = (value) => {
		// You can add additional logic here if needed
		props?.onChange(value);
	};

	const handleSelection = (val) => {
		// You can add additional logic here if needed
		console.log(val);
		setSelected(val);
		setLocalValue(val);
		props?.onChange(val);
		togglePopup();
	};

	useEffect(() => {
		setSelected(props.value);
		setLocalValue(props.value);
	}, [props.value]);

	return (
		<>
			<SelectWithModal
				name={props?.name}
				value={localValue}
				filter={props?.filter}
				callBack={callBack}
				optionLabel={["name"]} // custom field
				onChange={handleOnChange}
				reload={props?.reload}
				placeHolder="Search Group"
				disabled={loading || props?.disabled}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<BpGroupModal
							open={popup}
							onSelect={(value) => {
								console.log(value);
								handleSelection(value);
							}}
							onTogglePopUp={() => togglePopup()}
							// reload={props?.reload}
							selectedData={selected}
						/>
					)
				}
			/>
		</>
	);
};

export default SelectBPGroup;
