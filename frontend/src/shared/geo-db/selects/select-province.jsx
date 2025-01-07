import React, { useEffect, useState } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import TableProvinces from "../components-table/table-provinces";
import { getAllProvinces } from "@/api/geo/provinces";



const SelectProvince = ({ name, value, onChange, reload, countryId, disabled }) => {

	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllProvinces

	const filter = countryId ? { columns: { 'nation': { search: { value: countryId, operator: "=" } } } } : null

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
				optionLabel={["name", "code"]}
				filter={filter}
				onChange={(value) => handleOnchange(value)}
				reload={reload}
				disabled={disabled}
				placeHolder="Search Provinces"
				onTogglePopUp={togglePopup}
				extras={popup && (

					<Modal
						open={popup}
						onCancel={togglePopup}
						width={"60%"}
						title="Provinces"
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
						<TableProvinces
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


export default SelectProvince;
