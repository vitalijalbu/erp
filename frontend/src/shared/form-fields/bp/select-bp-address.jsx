import React, { useState, useEffect } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { Button, Modal, message } from "antd";
import { IconCheckbox } from "@tabler/icons-react";
import { getBPShippingAddresses } from "@/api/bp";
import TableAddresses from "@/shared/business-partners/table-addresses";


const SelectBPAddress = (props) => {
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState([]);
    const [popup, setPopup] = useState(false);
    const [selected, setSelected] = useState(null);
    //set default const type
    const type = props?.type ? props?.type : 'shipping';


    const fetchData = () => {
          getBPShippingAddresses(props?.idBP, type).then(({ data, error }) => {
				if (!error) {
					// basta passare data il map lo da all interno
					//devi passare optionLabel per cambiare la label
					// e optionValue per cambiare il value, di default è id
					setData(data.data);
					// setData(
					//     data?.data?.map((item) => ({
					//         label: item?.name,
					//         value: item?.id
					//     })) || []
					// );
					//console.log('data-received', data)
					setLoading(false);
				} else {
					message.error("An error occurred while fetching API");
					setLoading(false);
				}
			});
    } 
    useEffect(() => {
        //set default const type
        const type = props?.type ? props?.type : 'shipping';

        if (props?.idBP !== undefined && props?.idBP !== null) {
            setLoading(true);
            fetchData()
        }
    }, [props?.idBP]);

    useEffect(()=> {
        if(props.value){
            setSelected(props.value)
        }
    }, [props.value])
    

    const togglePopup = () => {
        if (popup) {
            fetchData()
        }
        setPopup(!popup);
    };


    const handleOnchange = (value) => {
        props?.onChange(value)
    }
    const handleSelection = () => {
        props?.onChange(selected)
        togglePopup()
    }


    return (
        <>
            <SelectWithModal
                name={props?.name}
                value={props?.value}
                options={data}
                filter={props?.filter}
                status={props?.status}
                optionLabel="name"
                onChange={(value) => handleOnchange(value)}
                reload={props?.reload}
                placeHolder={props?.placeHolder || "Search BP Address"}
                disabled={props?.disabled}
                onTogglePopUp={togglePopup}
                extras={popup && (
                    <Modal
                        open={popup}
                        onCancel={togglePopup}
                        width="90%"
                        transitionName="ant-modal-slide-up"
                        className="modal-fullscreen"
                        title="Select BP Address"
                        centered
                        maskClosable={false}
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
                        <TableAddresses
                            onSelect={(value) => setSelected(value)}
                            selectable={true}
                            isModal={true}
                            filter={props?.filter}
                            id={props?.idBP || null}
                            type={type}
                            selectType="radio"
                            value={props?.value}
                            selectedData={selected}
                        />
                    </Modal>
                )}
            />
        </>
    )
}


export default SelectBPAddress;
