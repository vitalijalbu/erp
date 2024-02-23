import React, { useEffect, useState } from "react";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllContacts } from "@/api/contacts";
import TableContacts from "@/shared/contacts/table-contacts";

const SelectContact = (props) => {
	const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllContacts;

	const handleOnChange = (value) => {
		// You can add additional logic here if needed
		props?.onChange(value);
	};

	const handleSelection = () => {
		// You can add additional logic here if needed
		props?.onChange(selected);
		togglePopup();
	};

	useEffect(() => {
		setSelected(props.value);
	}, [props.value]);

	return (
		<>
			<SelectWithModal
				name={props?.name}
				value={props?.value}
				filter={props?.filter}
				callBack={callBack}
				optionLabel={["name"]} // custom field
				onChange={handleOnChange}
				reload={props?.reload}
				placeHolder="Search Contact"
				disabled={loading || props?.disabled}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<Modal
							open={popup} // Use visible instead of open
							onCancel={togglePopup}
							width="90%"
							transitionName="ant-modal-slide-up"
							className="modal-fullscreen"
							title="Contacts"
							centered
							maskClosable={false}
							footer={[
								<Button
									key={0}
									onClick={togglePopup}
								>
									Close
								</Button>,
								<Button
									key={1}
									type="primary"
									htmlType="submit"
									icon={<IconCheckbox />}
									onClick={handleSelection}
									// disabled={!selected}
								>
									Select
								</Button>,
							]}
						>
							<TableContacts
								onSelect={(value) => setSelected(value)}
								selectedData={selected}
								selectable={true}
								filter={props?.filter}
								isModal={true}
								selectType="radio"
							/>
						</Modal>
					)
				}
			/>
		</>
	);
};

export default SelectContact;
