import React, { useState } from "react";
import {
    Button,
    Modal,
} from "antd";
import FormBody from "./form-body";

const ModalContact = ({ opened, toggle, reload, data, onSave }) => {
    // const { id } = router.query;
    const [loading, setLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);

    return (
        <Modal
            open={opened}
            onCancel={toggle}
            width={"60%"}
            transitionName="ant-modal-slide-up"
            title={data?.id ? (                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
                <>
                    Update Contact - <mark>{data?.name || ""}</mark>
                </>
            ) : "Add new Contact"
            }
            centered
            maskClosable={false}
            destroyOnClose={true}
            footer={[
                <Button key={0} onClick={toggle}>
                    Close
                </Button>,
                <Button
                    // disabled={!formChanged}
                    key="submit"
                    type="primary"
                    htmlType="submit"
                    form="form-contact"
                    loading={loading}
                    disabled={!isFormChanged}
                >
                    {data ? "Save" : "Create"}
                </Button>,
            ]}
        >
            <FormBody
                isModal={true}
                toggle={toggle}
                reload={reload}
                data={data}
                id={data?.id}
                changesWatcher={(value) => setIsFormChanged(value)}
                onLoading={(value) => setLoading(value)}
                onSave={(value)=> onSave(value)}
            />
        </Modal>
    );
};

export default ModalContact;
