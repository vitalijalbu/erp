import React, { useEffect, useState } from "react";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import AddressesTable from "./table-addresses";
import { getAllAddresses } from "@/api/addresses/addresses";

const SelectAddress = (props) => {
	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllAddresses;

	const handleOnchange = (value) => {
		props?.onChange(value);
		// console.log('selected', value)
	};

	// const removeSelected = () => {
	//     if (props.onRemove) {
	//         props.onRemove();
	//         props?.onChange(null)
	//     }

	//     togglePopup();
	// }

	const handleSelection = () => {
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
				callBack={callBack}
				filter={props?.filter}
				optionLabel="name"
				onChange={(value) => handleOnchange(value)}
				reload={props?.reload}
				disabled={props?.disabled}
				placeHolder="Search Address"
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<Modal
							open={popup}
							onCancel={togglePopup}
							title="Addresses"
							width="90%"
							transitionName="ant-modal-slide-up"
							className="modal-fullscreen"
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
							<AddressesTable
								onSelect={(value) => setSelected(value)}
								// onTableRemove={() => removeSelected()}
								selectedData={selected}
								selectable={true}
								isModal={true}
								// returnValue={props?.returnValue}
							/>
						</Modal>
					)
				}
			/>
		</>
	);
};

export default SelectAddress;
