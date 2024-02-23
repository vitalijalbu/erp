import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import { Button, Input, Modal } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";
import Constraint from "../constraints/constraint";

const ModalConstraint = ({ opened, toggle, data, subtype, onSave }) => {

  // Set page permissions
  if (!UserPermissions.authorizePage("configurator.manage")) {
    return false;
  }

  const [formChanged, setFormChanged] = useState(false);

  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleModalClose = async () => {
    toggle();
  }

  // Close modal confirmation if form state is TRUE
  const handleExit = () => {
    if (formChanged === true) {
      confirm({
        title: "Confirm exit without saving?",
        icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
        transitionName: "ant-modal-slide-up",
        content: "Seems like you forgot to save your edits",
        okText: "Exit",
        okType: "danger",
        cancelText: "Cancel",
        zIndex: 3000,
        onOk() {
          setFormChanged(false);
          handleModalClose();
        },
      });
    } else {
      handleModalClose();
    }
  };

  return (
    <>
      <Modal
        className="modal-fullscreen modal-fixed-footer"
        open={opened}
        destroyOnClose={true}
        onCancel={handleExit}
        title={data ? (
          <>
            Update Constraint <mark>{data.id}</mark>
          </>
        ) : (`Create new Constraint`)
        }
        centered
        width="90%"
        maskClosable={false}
        transitionName="ant-modal-slide-up"
        footer={[
          <Button key={0} onClick={handleExit}>
            Close
          </Button>,
          <Button key={1} type="primary" htmlType="submit" onClick={() => { setIsDraft(false) }} loading={loading} form="form-constraint">
            Save
          </Button>,
          (isDraft || !data?.id) ? <Button key={2} htmlType="submit" onClick={() => { setIsDraft(true) }} loading={loading} form="form-constraint">
            Save as Draft
          </Button> : <></>
        ]}
      >
        <Constraint
          id={data?.id || null}
          saveEnabled={true}
          deleteEnabled={data?.id}
          isDraft={isDraft}
          setIsDraft={setIsDraft}
          loading={loading}
          setLoading={setLoading}
          formChanged={formChanged}
          setFormChanged={setFormChanged}
          subtype={subtype}
          onSave={(val) => {
            handleModalClose();
            toggle();
            onSave(val);
          }}
          onUpdate={() => {
            handleModalClose();
            toggle();
          }}
        />
      </Modal>
    </>
  );
};

export default ModalConstraint;
