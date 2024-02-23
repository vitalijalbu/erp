import React, { useState, useEffect } from "react";
import SelectWithModal from "../components/select-with-modal";
import SelectMachineModal from "../machines/select-machine-modal";

const SelectMachine = ({ name, value, onChange, disable }) => {
	const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllMachines;

	const handleOnChange = (value) => {
		// You can add additional logic here if needed
		onChange(value);
	};

	const handleSelection = (value) => {
		// You can add additional logic here if needed
		setSelected(value);
		onChange(value);
		togglePopup();
	};

	useEffect(() => {
		setSelected(props.value);
	}, [props.value]);
	return (
		<>
			<SelectWithModal
				name={name}
				value={value}
				onChange={(value) => handleOnChange(value)}
				disabled={disable}
				optionLabel={"id"}
				callBack={callBack}
				placeHolder={"Select Machine"}
				extras={
					popup && (
						<SelectMachineModal
							onSelect={(value) => handleSelection(value)}
							opened={popup}
							toggle={togglePopup}
							data={selected}
						/>
					)
				}
			/>
		</>
	);
};
export default SelectMachine;
