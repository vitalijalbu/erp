import React, { useState, useEffect } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import TableZipCodes from "../components-table/table-zip-codes";
import { getAllZipCodes } from "@/api/geo/zip-codes";



const SelectZip = ({ name, value, onChange, reload, cityId, disabled }) => {

	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllZipCodes 

	const filter =  cityId ? { columns: { 'city_id': { search: { value: cityId, operator: "=" } } } } : null

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
				optionLabel="code"
				filter={filter}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				disabled={disabled}
				placeHolder="Search Zip Code"
				onTogglePopUp={togglePopup}
				extras={popup && (

					<Modal
						open={popup}
						onCancel={togglePopup}
						width={"60%"}
						title="Zip Codes"
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
						<TableZipCodes 
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


export default SelectZip;
