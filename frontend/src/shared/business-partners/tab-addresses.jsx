import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button, Col, Row, Space, Modal, Table, Checkbox } from "antd";
import { IconX, IconPlus, IconCheckbox } from "@tabler/icons-react";
import _ from "lodash";
import TableAddresses from "@/shared/addresses/table-addresses";
import { parseBool, parseBoolInv } from "@/hooks/formatter";

const TabAddresses = ({ data, onChange, changesWatcher, reload }) => {
  const [loadingAction, setLoadingAction] = useState(null);
  const [selected, setSelected] = useState([]);
  const [popup, setPopup] = useState(false);
  const [selectedRows, setSelectedRows] = useState([]);
  const [existingRows, setExistingRows] = useState(data ?? []);
  // Create a state variable to store the pivot objects separately
  const [pivotState, setPivotState] = useState([]);
  //console.table(pivotState);

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
      const existingPivot = pivotState.find((pivot) => pivot.address_id === row.id);

      if (!existingPivot) {
        // If no matching object exists, create a new one
        return {
          address_id: row.id,
          is_sales: parseBoolInv(row.pivot?.is_sales) || 0,
          is_shipping: parseBoolInv(row.pivot?.is_shipping) || 0,
          is_invoice: parseBoolInv(row.pivot?.is_invoice) || 0,
          is_purchase: parseBoolInv(row.pivot?.is_purchase) || 0,
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
      if (pivot.address_id === recordId) {
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
      title: "Address",
      key: "name",
      render: (record) => (
        <Link href={`/addresses/${record?.id}`} target="_blank">
          {record?.name}
        </Link>
      ),
    },
    {
      title: "Sales",
      dataIndex: ["pivot", "is_sales"],
      key: "is_sales",
      render: (is_sales, record) => (
        <Checkbox
          defaultChecked={parseBool(is_sales)}
          onChange={(e) => {
            handleCheckbox(record?.id, "is_sales", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Shipping",
      dataIndex: ["pivot", "is_shipping"],
      key: "is_shipping",
      render: (is_shipping, record) => (
        <Checkbox
          defaultChecked={parseBool(is_shipping)}
          onChange={(e) => {
            handleCheckbox(record?.id, "is_shipping", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Invoice",
      dataIndex: ["pivot", "is_invoice"],
      key: "is_invoice",
      render: (is_invoice, record) => (
        <Checkbox
          defaultChecked={parseBool(is_invoice)}
          onChange={(e) => {
            handleCheckbox(record?.id, "is_invoice", e.target.checked);
          }}
        />
      ),
    },
    {
      title: "Purchases",
      dataIndex: ["pivot", "is_purchase"],
      key: "is_purchase",
      render: (is_purchase, record) => (
        <Checkbox
          defaultChecked={parseBool(is_purchase)}
          onChange={(e) => {
            handleCheckbox(record?.id, "is_purchase", e.target.checked);
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
    },
  ];


  return (
    <>
      {popup && (
        <Modal
          title="Select address"
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
          <TableAddresses
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

export default TabAddresses;
