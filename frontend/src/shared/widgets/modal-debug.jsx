import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Space, Avatar, Button, Row, Col, Tabs, Modal, Typography, message, List } from "antd";
import { IconTerminal, IconArrowsDiagonal } from "@tabler/icons-react";
import ConsoleDebug from "./console-debug";

const ModalDebug = ({ opened, toggle, data, reload }) => {
  const [loading, setLoading] = useState(false);

  const openResizableWindow = () => {
    const newWindow = window.open(
      '/widgets/console', 
      '_blank', 
      "directories=no,titlebar=no,toolbar=no,location=no,status=no,menubar=no,resizable=yes,width=800px,height=800px"
    );
    if (newWindow) {
      newWindow.focus(); // Set focus on the new window
    } else {
      console.error("Failed to open resizable window.");
    }
  };

  return (
    <Modal
      open={opened}
      theme="dark"
      onCancel={toggle}
      title={<Space>
        <Avatar style={{ backgroundColor: '#fde3cf', color: '#f56a00', }} size="small" shape="square" icon={<IconTerminal />}/> Console 
            <Button icon={<IconArrowsDiagonal/>} onClick={openResizableWindow}>Open in new window</Button>
      </Space>}
      maskClosable={false}
      width={'90%'}
      className="modal-fullscreens"
      footer={false}
      transitionName="ant-modal-slide-up">
     
     <div>
     <ConsoleDebug/>
     </div>
    </Modal>
  );
};

export default ModalDebug;

