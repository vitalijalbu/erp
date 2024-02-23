import React, { useEffect, useState } from "react";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getAllStocks } from "@/api/stocks";
import TableStocks from "./table-stocks";


const SelectLot = (props) => {
    const [popup, setPopup] = useState(false);
	const [loading, setLoading] = useState(false);
	const [selected, setSelected] = useState(null);

    const togglePopup = () => {
		setPopup(!popup);
	};

    const callBack = getAllStocks;

    const handleOnChange = (value) => {
		props.onChange(value);
	};


    const handleSelection = () => {
		props.onChange(selected);
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
				optionLabel={["id_lot"]} 
				optionValue={"id_lot"} 
				onChange={(val)=> handleOnChange(val)}
				reload={props?.reload}
				placeHolder="Select Stock"
				disabled={loading || props?.disabled}
				onTogglePopUp={togglePopup}
				status={props.status}
				extras={
					popup && (
						<Modal
							open={popup} 
							onCancel={togglePopup}
							width="100%"
							transitionName="ant-modal-slide-up"
							className="modal-fullscreen"
							title="Stocks"
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
								>
									Select
								</Button>,
							]}
						>
                            <TableStocks 
                                onSelect={(value) => setSelected(value)}
                                selectedData={selected}
                                selectable={true}
                                isModal={true}
                                selectType="radio"
								filter={props.filter}
                            />
						</Modal>
					)
				}
			/>
		</>
	);


};

export default SelectLot;