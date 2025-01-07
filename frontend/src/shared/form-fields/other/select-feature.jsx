import React, { useState, useEffect } from "react";
import { getAllFeatures } from "@/api/configurator/features";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";
import ModalFeatureTable from "@/shared/configurator/configuration/modal-feature-table";

const SelectFeature = ({ name, value, disabledOptions, onChange, reload }) => {
	const [popup, setPopup] = useState(false);
	const [filters, setFilters] = useState([]);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	useEffect(() => {
		if (value) {
			setSelected(value);
		}
	}, [value]);

	// const filters = { columns: { 'id': { search: { value: disabled, operator: 'notin' } } } }
	const featureCall = getAllFeatures;

  const handleOnchange = (value) => {
		onChange(value);
	};

	return (
		<>
			<SelectWithModal
				name={name}
				value={value}
				callBack={featureCall}
				filter={filters}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				optionLabel={["id", "label"]}
				disabledOptions={disabledOptions}
				placeHolder="Search Feature"
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<ModalFeatureTable
							opened={popup}
							disabled={disabledOptions}
							toggle={togglePopup}
							onSelect={(value) => handleOnchange(value)}
							// filter={filters}
							selectable={true}
							selectedData={selected}
						/>
					)
				}
			/>
		</>
	);
};

export default SelectFeature;
