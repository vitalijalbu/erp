import React, { useEffect, useState } from "react";
import { getAllItemSubFamilies } from "@/api/items";
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import ItemSubGroupTable from "../../items/components-table/table-item-subgroup";



const SelectItemSubGroup = ({ name, value, onChange, reload, disabled }) => {
    const [popup, setPopup] = useState(false);
    const [selected, setSelected] = useState(null);


    const togglePopup = () => {
        setPopup(!popup);
    };

    const callBack = getAllItemSubFamilies;

    const handleOnchange = (value) => {
        onChange(value);
    };

    const handleSelection = () => {
        onChange(selected);
        togglePopup();
    };

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
                optionLabel={["code", "description"]}
                onChange={(value) => handleOnchange(value)}
                reload={reload}
                disabled={disabled}
                placeHolder="Select Item Groups"
                onTogglePopUp={togglePopup}
                extras={popup && (

                    <Modal
                        open={popup}
                        onCancel={togglePopup}
                        width="60%"
                        transitionName="ant-modal-slide-up"
                        className="modal-fullscreen"
                        title="Item Groups"
                        centered
                        maskClosable={false}
                        footer={[
                            <Button key={0} onClick={togglePopup}>
                                Close
                            </Button>,
                            <Button
                                // disabled={!selected}
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
                        <ItemSubGroupTable
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

export default SelectItemSubGroup