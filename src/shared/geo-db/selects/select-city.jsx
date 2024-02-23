import React, { useState, useEffect } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import TableCities from "../components-table/table-cities";
import { getAllCities } from "@/api/geo/cities";



const SelectCity = ({ name, value, onChange, reload, countryId, provId, disabled }) => {

	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);
	// const [filter, setFilter] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllCities;
	
	const filter = countryId && !provId
	? { columns: { 'nation': { search: { value: countryId, operator: "=" } } } }
	: countryId && provId
	? { columns: { 'province_id': { search: { value: provId,  operator: "=" } } } }
	: null;


	const handleOnchange = (value) => {
		onChange(value)
	}
	const handleSelection = () => {
		onChange(selected)
		togglePopup()
	}

	useEffect(() => {
		if (value) {
		  setSelected(value); 
		}
	  }, [value]);

	return (
		<>
			<SelectWithModal
				name={name}
				value={value}
				callBack={callBack}
				optionLabel="name"
				filter={filter}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				disabled={disabled}
				placeHolder="Search City"
				onTogglePopUp={togglePopup}
				extras={popup && (

					<Modal
						open={popup}
						onCancel={togglePopup}
						width={"60%"}
						title="Cities"
						centered
						maskClosable={false}
						transitionName="ant-modal-slide-up"
						footer={[
							<Button key={0} onClick={togglePopup}>
								Close
							</Button>,
							<Button
								key={1}
								type="primary"
								htmlType="submit"
								icon={<IconCheckbox />}
								onClick={handleSelection}
							>
								Select
							</Button>,
						]}
					>
						<TableCities
							filter={filter}
							onSelect={(value) => setSelected(value)} 
							selectedData={selected}
							selectable
							openInModal={true}
						/>
					</Modal>
				)}
			/>
		</>
	)
}


export default SelectCity;
