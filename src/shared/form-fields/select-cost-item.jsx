import React, { useEffect, useState } from "react";
import SelectWithModal from "../components/select-with-modal";
import { getAllItems } from "@/lib/api/items";
import { Button, Modal } from "antd";
import ItemTable from "../items/components-table/simple-items-table";
import { IconCheckbox } from "@tabler/icons-react";
import { getSession } from "@/lib/api";


const SelectCostItem = ({ name, value, onChange, disabled, type, withShared = true }) => {

	const user = getSession();
	const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

	const togglePopup = () => {
		setPopup(!popup);
	};

	const callBack = getAllItems;
	const filter = {
		columns: {
		  type: { search: { value: type } },
		  enabled: { search: { value: 1 } },
		},
	  };
	  
	  // Conditionally add the 'company' filter
	  if (withShared === false) {
		filter.columns.company = { search: { value: user?.IDcompany } };
	  }


	const handleOnChange = (value) => {
		// You can add additional logic here if needed
		console.log(value)
		onChange(value);
	};

	const handleSelection = (value) => {
		// You can add additional logic here if needed
		console.log(value)
		setSelected(value);
		onChange(value);
		togglePopup();
	};

	useEffect(() => {
		setSelected(value);
	}, [value]);
	return (
		<>
			<SelectWithModal
				name={name}
				value={value}
				onChange={(value) => handleOnChange(value)}
				disabled={disabled}
				optionLabel={["item", "item_desc"]}
				callBack={callBack}
				filter={filter}
				placeHolder={"Select Item"}
				onTogglePopUp={togglePopup}
				extras={
					popup && (
						<Modal
							open={popup}
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
									onClick={() => handleSelection(selected)}
								>
									Select
								</Button>,
							]}
						>
							<ItemTable
								onSelect={(value) => setSelected(value)}
								selectedData={selected}
								selectable={true}
								filter={filter}
								isModal={true}
							/>
						</Modal>
					)
				}
			/>
		</>
	);
};
export default SelectCostItem;
