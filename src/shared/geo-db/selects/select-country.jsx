import React, { useEffect, useState} from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import CountriesTable from "../components-table/table-countries";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllNations } from "@/api/geo/nations";



const SelectCountry = ({ name, value, onChange, reload, disabled }) => {

	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllNations

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
				onChange={(value) => handleOnchange(value) }
				reload={reload}
				disabled={disabled}
				placeHolder="Search Country"
				onTogglePopUp={togglePopup}
				extras={popup && (
					<Modal
						open={popup}
						onCancel={togglePopup}
						width={"60%"}
						title="Countries"
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
						<CountriesTable onSelect={(value) => setSelected(value)} selectedData={selected} selectable openInModal={true}/>
					</Modal>
				)}
			/>
		</>
	)
}


export default SelectCountry;
