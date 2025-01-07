import React, { useEffect, useState } from "react";
import _ from "lodash";
import { Button, Modal, Tag } from "antd";
import { IconCheckbox, IconPlus } from "@tabler/icons-react";
import ModalFeature from "./modal-feature";
import { getAllFeatures } from "@/api/configurator/features";
import PageActions from "@/shared/components/page-actions";
import TableFiltered from "@/shared/components/table-filtered";
import { columnsProductSellerConfigurator } from '@/data/column-standard-product-seller'
const ModalFeatureTable = ({
  opened,
  toggle,
  onSelect,
  value,
  selectable = true,
  dataSource,
  title
}) => {
  const [selected, setSelected] = useState(null);
  const [feature, setFeature] = useState(null);
  const [popupFeature, setPopupFeature] = useState(false);
  const column = columnsProductSellerConfigurator()
  const toggleFeaturePopup = (record = null) => {
    setFeature(record);
    setPopupFeature(!popupFeature);
  };

  const handleSelection = () => {
    onSelect(selected);
    toggle();
  };

  useEffect(() => {
    setSelected(value)
  }, [opened])



  return (
    <Modal
      open={opened}
      onCancel={() => toggle()}
      onOk={handleSelection}
      width={"80%"}
      title={<>Select Item for: <mark>{title}</mark></>}
      centered
      maskClosable={false}
      className="modal-fullscreen"
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={() => toggle()}>
          Close
        </Button>,
        <Button
          disabled={!selected}
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

      <PageActions
        title="Select Item"

      />


      <TableFiltered
        tableLayout='fixed'
        dataSource={dataSource}
        rowKey={(record) => record.IDitem}
        columns={column}
        selectable={selectable}
        onSelect={onSelect}
        pagination={true}
        width={"100%"}
        rowSelection={
          selectable
            ? {
              type: "radio",
             // selectedRowKeys: [selected],
              // onSelect: (record) => {
              //   setSelected(record.IDItem);
              // },
              getCheckboxProps: (record) => ({
                id: record.id,
              }),
              onChange: (selectedRowKeys, selectedRows) => {
                setSelected(selectedRows[0].IDitem);
              },
            }
            : false
        }
      />
    </Modal>
  );
};

export default ModalFeatureTable;
