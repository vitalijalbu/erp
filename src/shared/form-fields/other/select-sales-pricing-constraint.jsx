import React, { useEffect, useState } from "react";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";
import { getAllConstraints } from "@/api/configurator/constraints";
import SelectPricingConstraint from "@/shared/configurator/pricing-constraints/select-sales-pricing-contraint-modal";

const SelectSalesPricing = ({
	name,
	value,
	type,
	onChange,
	data,
	reload,
	record,
	placeHolder,
}) => {
	const [popup, setPopup] = useState(false);
	const [disabled, setDisabled] = useState(false);

	useEffect(() => {
		setDisabled(record?.constraints?.map((el) => el.constraint_id));
	}, [record]);

	const constraintType = "price";
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
				mode={type === "multiple" ? "multiple" : "single"}
				callBack={constraintCall}
				filter={filters}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				optionLabel={["id", "label"]}
				placeHolder={placeHolder}
				disabledOptions={disabled}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<SelectPricingConstraint
							type={type}
							disabled={disabled}
							record={record}
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

export default SelectSalesPricing;
