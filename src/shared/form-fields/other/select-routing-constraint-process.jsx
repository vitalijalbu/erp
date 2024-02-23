import React, { useState } from "react";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";

import { getAllProcesses } from "@/api/processes/processes";
import SelectRoutingProcessModal from "@/shared/configurator/routing-constraints/select-routing-constraint-process-modal";

const SelectBomConstraint = ({ name, value, onChange, reload, placeHolder }) => {
	const [popup, setPopup] = useState(false);

	const constraintCall = getAllProcesses;

	const togglePopup = () => {
		setPopup(!popup);
	};

	const handleOnchange = (value) => {
		onChange(value);
	};

	const handleSelect = (value) => {
		onChange(value);
		togglePopup();
	};

	return (
		<>
			<SelectWithModal
				name={name}
				value={value}
				callBack={constraintCall}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				optionLabel={["id", "name"]}
				placeHolder={placeHolder}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<SelectRoutingProcessModal
							data={{
								["id"]: value,
							}}
							onSelect={(value) => handleSelect(value)}
							opened={popup}
							reload={reload}
							returnOnlyId={true}
							toggle={togglePopup}
						/>
					)
				}
			/>
		</>
	);
};

export default SelectBomConstraint;
