import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Col, Row, Space, Modal, Table, Checkbox } from "antd";
import { IconX, IconPlus, IconCheckbox } from "@tabler/icons-react";
import _ from "lodash";
import { parseBoolInv, parseBool } from "@/hooks/formatter";
import TableContacts from "@/shared/contacts/table-contacts";

const TabContacts = ({ data, onChange, changesWatcher, reload }) => {
  const [loadingAction, setLoadingAction] = useState(null);
  const [selected, setSelected] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [existingRows, setExistingRows] = useState(data ?? []);
  // Create a state variable to store the pivot objects separately
  const [pivotState, setPivotState] = useState([]);
  console.table(pivotState);

  // Toggle Popup
  const togglePopup = () => {
    setPopup(!popup);
    setSelected([]);
    setSelectedRows([]);
  };

  // Initialize the pivotState using useEffect
  useEffect(() => {
    if (existingRows.length > 0) {
      clonePivots(_.map(existingRows, "id")); // Construct new pivots in state
      //callback parent
      onChange(pivotState);
    }
  }, [existingRows]);

  // Initialize the pivotState using useEffect
  useEffect(() => {
    //changesWatcher(true);
    onChange(pivotState);
  }, [pivotState]);

  // Function to clone new pivot and attach to array state
  const clonePivots = () => {
    const newPivotObjects = existingRows.map((row) => {
      // Check if an object with the same address_id already exists in pivotState
      const existingPivot = pivotState.find((pivot) => pivot.contact_id === row.id);

      if (!existingPivot) {
        // If no matching object exists, create a new one
        return {
          contact_id: row.id,
          quotation: parseBool(row.pivot?.quotation) || 0,
          order_confirmation: parseBool(row.pivot?.order_confirmation) || 0,
          billing: parseBool(row.pivot?.billing) || 0,
          delivery_note: parseBool(row.pivot?.delivery_note) || 0,
        };
      } else {
        // If a matching object exists, return it without changes
        return existingPivot;
      }
    });

    // Update the pivotState to include the new pivot objects
    setPivotState(newPivotObjects);
    onChange(newPivotObjects); // Pass the updated state to the parent component
    setSelected([]);
    setSelectedRows([]);
  };

  // Handle Delete with Single Row
  const handleDelete = async (id) => {
    // Pass difference array of deleted ones & existing ones using _.differenceBy
    const updatedRows = _.differenceBy(existingRows, [{ id }], "id");
    setExistingRows(updatedRows);
    onChange(updatedRows);
    changesWatcher(true);
    setSelected([]);
    setSelectedRows([]);
  };

  // Handle Remove Selected BULK
  const handleRemoveSelected = async () => {
    // Create a set of selected IDs for efficient lookup
    const selectedSet = new Set(selected);
    // Use filter to remove rows with matching IDs
    const updatedRows = existingRows.filter((row) => !selectedSet.has(row.id));

    setExistingRows(updatedRows);
    setSelected([]);
    setSelectedRows([]);
    //paret
    onChange(updatedRows);
    changesWatcher(true);
  };

  const handleSelectRows = async (selectedRows) => {
    // When the "Select" button is clicked in the modal, add selected rows to the main table
    console.log(selectedRows)
    const allRows = [...existingRows, ...selectedRows];
    //clonePivots(_.map(selectedRows, "id")); // Construct new pivots in state
    setExistingRows(allRows);

    setPopup(false); // Close the modal

    // Update the parent component after state changes
    changesWatcher(true);
    onChange(pivotState);
    setSelected([]);
  };

  // Update the pivotState with the new values when checkboxes change
  const handleCheckbox = async (recordId, columnKey, value) => {
    const updatedPivotState = pivotState.map((pivot) => {
      if (pivot.contact_id === recordId) {
        // Create a new object to avoid mutating the original state
        const updatedPivot = { ...pivot };
        updatedPivot[columnKey] = parseBoolInv(value);
        return updatedPivot;
      }
      return pivot;
    });

    // Set the new state
    setPivotState(updatedPivotState);

    // Onchange, pass data to the parent component
    changesWatcher(true);
    onChange(pivotState);
  };

  // Define table columns
  const tableColumns = [
    {
      title: "Contact",
      key: "id",
      render: (record) => (
        <Link href={`/contacts/${record?.id}`} target="_blank">
          {record?.name}
        </Link>
      ),
    },
    {
      title: "Quotation",
      dataIndex: ["pivot", "quotation"],
      key: "quotation",
      render: (quotation, record) => (
        <Checkbox
          defaultChecked={parseBool(quotation)}
          onChange={(e) => {
            handleCheckbox(record?.id, "quotation", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Order confirmation",
      dataIndex: ["pivot", "order_confirmation"],
      key: "order_confirmation",
      render: (order_confirmation, record) => (
        <Checkbox
          defaultChecked={parseBool(order_confirmation)}
          onChange={(e) => {
            handleCheckbox(record?.id, "order_confirmation", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Billing",
      dataIndex: ["pivot", "billing"],
      key: "billing",
      render: (billing, record) => (
        <Checkbox
          defaultChecked={parseBool(billing)}
          onChange={(e) => {
            handleCheckbox(record?.id, "billing", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Delivery note",
      dataIndex: ["pivot", "delivery_note"],
      key: "delivery_note",
      render: (delivery_note, record) => (
        <Checkbox
          defaultChecked={parseBool(delivery_note)}
          onChange={(e) => {
            handleCheckbox(record?.id, "delivery_note", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <Button
          icon={<IconX color="#e20004" />}
          loading={loadingAction === record?.id}
          onClick={() => handleDelete(record?.id)}
        >
          Remove
        </Button>
      ),
    }
  ];


  return (
    <>
      {popup && (
        <Modal
          title="Select contact"
          width="90%"
          transitionName="ant-modal-slide-up"
          className="modal-fullscreen"
          centered
          open={popup}
          destroyOnClose={true}
          onCancel={togglePopup}
          footer={
            <Space>
              <Button onClick={togglePopup}>Close</Button>
              <Button
                type="primary"
                icon={<IconCheckbox />}
                onClick={() => handleSelectRows(selectedRows)} // Handle the click on the "Select" button
                disabled={selectedRows.length === 0}
              >
                Select
              </Button>
            </Space>
          }
        >
          <TableContacts
            isModal={true}
            actions={false}
            selectable={true}
            filter={{ columns: { id: { search: { value: _.map(existingRows, "id"), operator: "notin" } } } }}
            onSelect={(selectedRows) => setSelectedRows(selectedRows)}
            selection="checkbox"
            isAssociation={true}
          />
        </Modal>
      )}
      <Row>
        <Col span={24} className="mb-3">
          <Space>
            {selected.length > 0 ? (
              <Button icon={<IconX color="#e20004" />} onClick={() => handleRemoveSelected()}>
                Remove
              </Button>
            ) : (
              <Button icon={<IconPlus color="#33855c" />} onClick={() => togglePopup()}>
                Associate
              </Button>
            )}
          </Space>
        </Col>
        <Col span={24} className="mb-3">
          <Table
            dataSource={existingRows} // Use existingRows here
            columns={tableColumns}
            rowKey={(record) => record?.id}
            loading={loadingAction !== null}
            pagination={{ hideOnSinglePage: true, pageSize: 200 }}
            rowSelection={{
              type: "checkbox",
              fixed: true,
              selectedRowKeys: selected,
              onChange: (selectedRowKeys, selectedRows) => {
                setSelected(selectedRowKeys);
              },
            }}
          />
        </Col>
      </Row>
    </>
  );
};

export default TabContacts;
