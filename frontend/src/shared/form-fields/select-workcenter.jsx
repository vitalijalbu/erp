import React, { useEffect, useState } from "react";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllWorkcenters } from "@/api/workcenters";
import { getSession } from "@/lib/api";
import TableWorkcenters from "@/shared/workcenters/table-workcenters";

const SelectWorkcenter = (props) => {
	const user = getSession();
	const defaultValue = user?.default_workcenter;

	const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllWorkcenters;

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

	useEffect(() => {
		// check value only for undefined because default value in creation, null can come from db and doesn't have to be overrided
		if (props.value === undefined && props.setDefault && _.isFunction(props.setDefault)) {
			// onChange in this case will trigger the form touched, is needed a custom event to set the field value
			props.setDefault(defaultValue);
		}
	}, []);
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
				status={props.status}
				placeHolder="Search Workcenter"
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
							title="Workcenters"
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
							<TableWorkcenters
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

export default SelectWorkcenter;
