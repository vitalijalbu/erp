import React, { useState } from "react";
import { useRouter } from "next/router";
import AddressForm from "./form-body";
import {
    Button,
    Form,
    Modal
} from "antd";


const ModalAddress = ({ opened, toggle, reload, data, onSave }) => {
    const router = useRouter();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    // const [data, setData] = useState(null);
    const [selected, setSelected] = useState(null);
    const [formChanged, setFormChanged] = useState(false);
    //const validationErrorsBag = useValidationErrors();

 

    return (
        <Modal
            open={opened}
            onCancel={toggle}
            width={"60%"}
            title={data?.id ? (
                <>
                  Update Address - <mark>{data.name}</mark>
                </>
                )  : "Add new address"
            }
            centered
            maskClosable={false}
            transitionName="ant-modal-slide-up"
            footer={[
                <Button key={0} onClick={toggle}>
                    Close
                </Button>,
                <Button
                    // disabled={!formChanged}
                    key={1}
                    type="primary"
                    htmlType="submit"
                    form="address-form"
                    loading={loading}
                >
                    Save
                </Button>,
            ]}
        >
            <AddressForm
                isModal={true}
                toggle={toggle}
                reload={reload}
                // data={data} 
                id={data?.id}
                onLoading={(value)=>setLoading(value)}
                onSave={(value)=>onSave(value)}
                />
        </Modal>
    );
};

export default ModalAddress;
