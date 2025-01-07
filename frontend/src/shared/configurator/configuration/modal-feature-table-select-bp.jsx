import React, { useEffect, useState } from "react";
import _ from "lodash";
import { Button, Modal, Tag } from "antd";
import { IconCheckbox, IconPlus } from "@tabler/icons-react";
import PageActions from "@/shared/components/page-actions";
import { columnsProductSellerConfigurator } from '@/data/column-standard-product-bp'
import Datatable from "@/shared/datatable/datatable";
const ModalFeatureTable = ({
  opened,
  toggle,
  onSelect,
  value,
  selectable = true,
  callBack
}) => {
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);
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

  const handleTableChange = async (filters) => {
    setLoading(true);
    const response = await callBack(filters);
    setLoading(false);
    return response.data;
  }
  useEffect(() => {
    setSelected(value)
  }, [opened])


  return (
    <Modal
      open={opened}
      onCancel={toggle}
      onOk={handleSelection}
      width={"60%"}
      title="Business Partner"
      centered
      maskClosable={false}
      className="modal-fullscreen"
      transitionName="ant-modal-slide-up"
      footer={[
        <Button key={0} onClick={toggle}>
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
        title="Select Business Partner"

      />


      <Datatable
        fetchData={handleTableChange}
        loading={loading}
        rowKey="id"
        columns={column}
        width={"100%"}
        rowSelection={
          selectable
            ? {
              type: "radio",
              selectedRowKeys: [selected],
              onSelect: (record) => {
                setSelected(record.id);
              },
              getCheckboxProps: (record) => ({
                id: record.id,
              }),
              onChange: (selectedRowKeys, selectedRows) => {
                setSelected(selectedRows[0].id);
              },
            }
            : false
        }
      />
    </Modal>
  );
};

export default ModalFeatureTable;
