import React, { useState } from "react";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";
import { getAllConstraints } from "@/api/configurator/constraints";
import SelectRoutingConstraint from "@/shared/configurator/routing-constraints/select-routing-constraint-modal";

const SelectBomConstraint = ({
	name,
	value,
	onChange,
	reload,
	placeHolder,
}) => {
	const [popup, setPopup] = useState(false);

	const constraintType = "routing";
	const filters = {
		columns: {
			constraint_type: {
				search: { value: constraintType },
			},
			is_draft: {
				search: { value: "0" },
			},
		},
	};

	const constraintCall = getAllConstraints;

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
				filter={filters}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				optionLabel={["id", "label"]}
				placeHolder={placeHolder}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<SelectRoutingConstraint
							data={{
								["id"]: value,
							}}
							onSelect={(value) => handleSelect(value)}
							opened={popup}
							reload={reload}
							toggle={togglePopup}
						/>
					)
				}
			/>
		</>
	);
};

export default SelectBomConstraint;
