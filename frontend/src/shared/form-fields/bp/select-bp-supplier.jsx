import React, { useState, useEffect } from "react";
import _ from "lodash";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal, Select } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllBPSupplier } from "@/api/bp";
import TableBP from "@/shared/business-partners/table-bp-supplier";

const SelectBP = (props) => {
	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllBPSupplier;

	const handleOnchange = (value) => {
		props?.onChange(value);
	};

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
				optionLabel='desc'
				onChange={(value) => handleOnchange(value)}
				reload={props?.reload}
				status={props?.status}
				placeHolder={props?.placeHolder || "Search BP"}
				disabled={props?.disabled}
				onTogglePopUp={togglePopup}
				autofocus={props.autofocus}
				extras={
					popup && (
						<Modal
							open={popup}
							onCancel={togglePopup}
							width='90%'
							transitionName='ant-modal-slide-up'
							className='modal-fullscreen'
							title='Select Business Partner'
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
									type='primary'
									htmlType='submit'
									icon={<IconCheckbox />}
									onClick={handleSelection}
								>
									Select
								</Button>,
							]}
						>
							<TableBP
								onSelect={(value) => setSelected(value)}
								selectable={true}
								isModal={true}
								hasActions={true}
								filter={props?.filter}
								selectedData={selected}
							/>
						</Modal>
					)
				}
			/>
		</>
	);
};

export default SelectBP;
