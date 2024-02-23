import React, { useState } from 'react';
import {
    Space,
    Button,
    Radio,
    Modal
} from "antd";
import {
    IconDownload
} from "@tabler/icons-react";

export const ExportPrompt = (props) => {

    const [exportSelection, setExportSelection] = useState('all');

    const exportData = () => {
        props.onOk(exportSelection);
    };
    
    return (
        <Modal
            open={props.open}
            onOk={exportData}
            onCancel={props.onCancel}
            title="Export Data"
            transitionName="ant-modal-slide-up"
            icon={<IconDownload />}
            footer={[
                <Button key="back" disabled={props.loading ? 1 : 0} onClick={props.onCancel}>
                    Cancel
                </Button>,
                <Button key="submit" type="primary" icon={<IconDownload/>} loading={props.loading} onClick={exportData}>
                    Export
                </Button>
            ]}
        >
            <Radio.Group onChange={(e) => setExportSelection(e.target.value) } value={exportSelection}>
                <Space direction="vertical">
                    <Radio value={"all"}>All Data</Radio>
                    {props.pagination && <Radio value={"current"}>Current Page Only</Radio>}
                </Space>
            </Radio.Group>
        </Modal>
    )
};
