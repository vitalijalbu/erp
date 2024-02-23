import React, { useState, useEffect } from "react";
import PageActions from "@/shared/components/page-actions";
import { Tag, Button, Row, Col, Modal } from "antd";
import { IconCheckbox, IconPencilMinus, IconPlus, IconX } from "@tabler/icons-react";
import { getAllMachines } from "@/api/machines/machines";

const SelectMachineModal = ({ opened, toggle, data, reload, onSelect }) => {

  const [popupMachine, setPopupMachine] = useState(null);
  const [selected, setSelected] = useState(null);
  const [row, setRow] = useState(null);
  const [tableReload, setTableReload] = useState(0);
  const [machineId, setMachineId] = useState(null);

  const toggleMachinePopup = (record = null) => {
    setRow(record);
    setPopupMachine(!popupMachine);
  };

  const handleSelection = (row) => {
    setSelected(row);
  };

  const handleModalSave = (val) => {
    if (val) {
      setSelected(val);
      setMachineId(val.id);
      setTableReload(tableReload + 1);
    } else {
      setSelected(selected);
      setMachineId(costraintId);
      setTableReload(tableReload + 1);
    }
  };

  const onSave = () => {
    if (_.isObject(selected)) {
      onSelect(selected);
      return;
    }
    onSelect(selected.id);
  };

  const title = `Select Machine`;
  useEffect(() => {
    if (data && data["id"]) { 
      setMachineId(data["id"]);
      setSelected(data["id"]);
    }
  }, []);

  // Get Data
  const handleTableChange = async (filters) => {

    // TODO: maybe implement filters

    const result = await getAllMachines(filters);
    return result.data;
  };

  // Define table columns
  const tableColumns = [
		{
			title: "Code",
			key: "code",
			dataIndex: "code",
		},
		{
			title: "Description",
			key: "description",
			dataIndex: "description",
		},
		{
			title: "Workcenter",
			key: "workcenter.name",
			dataIndex: "workcenter",
		},
		{
			title: "Cost Item",
			key: "cost.item",
			dataIndex: "cost",
			render: (cost) => {
				return (
					<Typography.Text>
						{cost.item} - {cost.item_desc}
					</Typography.Text>
				);
			},
		},
		{
			title: "Men Occupation",
			key: "men_occupation",
			// dataIndex: "hourlyCost",
			// type: "currency",
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Button
					icon={<IconPencilMinus />}
					onClick={() => toggleMachinePopup(record)}
				>
					Edit
				</Button>
			),
		},
  ];

  return (
    <>
      {
        popupMachine && (
          <ModalMachine
            opened={popupConstraint}
            toggle={toggleMachinePopup}
            data={row || null}
            onSave={(val) => handleModalSave(val)}
          />
        )
      }
      <Modal
        key={3}
        open={opened}
        destroyOnClose={true}
        onCancel={toggle}
        title={
          data["code"] != null ? (
            <>
              Selected Machine -{" "}
              <mark>{data["code"]}</mark>
            </>
          ) : (
            "Select Machine"
          )
        }
        centered
        width="60%"
        maskClosable={false}
        className="modal-fullscreen"
        transitionName="ant-modal-slide-up"
        footer={[
          <Button
            key={0}
            onClick={toggle}
          >
            Close
          </Button>,
          <Button
            key={1}
            type="primary"
            onClick={onSave}
            icon={<IconCheckbox />}
          >
            Select
          </Button>,
        ]}
      >
        <div className="page">
          <PageActions
            title={title}
            extra={[
              <Button
                key={2}
                disabled={!selected}
                icon={<IconX color="#e20004" />}
                onClick={() => {
                  setMachineId(null);
                  setSelected(null);
                }}
              >
                Remove current selection
              </Button>,
              <Button
                type="primary"
                key={4}
                icon={<IconPlus />}
                onClick={() => toggleMachinePopup()}
              >
                Add new
              </Button>,
            ]}
          />

          <div className="page-content">
            <Row>
              <Col span={24}>
                <Datatable
                  fetchData={handleTableChange}
                  columns={tableColumns}
                  rowKey="id"
                  watchStates={[reload, data, tableReload]}
                  rowSelection={{
                    type: "radio",
                    onChange: (selectedRowKeys, selectedRows) => {
                      setMachineId(selectedRows[0].id);
                      handleSelection(selectedRows[0]);
                    },
                    getCheckboxProps: (record) => ({
                      code: record.id
                    }),
                    selectedRowKeys: [machineId],  
                  }}
                />
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </>
  );
}

export default SelectMachineModal;
