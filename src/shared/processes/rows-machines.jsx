import React, { useState, useEffect, useRef } from "react";
import { Card, Space, Table, Button, Modal, Switch, Typography, Alert } from "antd";
const { Text } = Typography;
import _ from "lodash";
import { IconCheckbox, IconPlus, IconX } from "@tabler/icons-react";
import TableMachines from "@/shared/machines/table-machines";

const RowsMachines = ({ data, onChange, loading, errors }) => {
	const [popup, setPopup] = useState(false);
	const [selectedRows, setSelectedRows] = useState([]);
	const [existingRows, setExistingRows] = useState(data ?? []);
	const [pivotState, setPivotState] = useState([]);
	const [errorsArray, setErrorsArray] = useState(errors || {});
	const firstIteration = useRef(true);

	useEffect(() => {
		setErrorsArray(errors || {});
	}, [errors]);


	// Toggle Popup
	const togglePopup = () => {
		setPopup((prevPopup) => !prevPopup);
		setSelectedRows([]);
	};

	// Initialize the pivotState using useEffect
	useEffect(() => {
		//if (existingRows.length > 0) {
		clonePivots(existingRows); // Construct new pivots in state
		//}
	}, [existingRows]);

	// Initialize the pivotState using useEffect
	useEffect(() => {
		//changesWatcher(true);
		onChange(pivotState, firstIteration.current);
	}, [pivotState]);

	// Function to clone new pivot and attach to array state
	const clonePivots = (values) => {
		const newPivotObjects = values.map((row) => {
			// Check if an object with the same address_id already exists in pivotState
			const existingPivot = pivotState.find((pivot) => pivot.machine_id === row.id);
			if (!existingPivot) {
				// If no matching object exists, create a new one
				return {
					code: row.code,
					machine_id: row?.pivot?.machine_id || row.id,
					description: row.description,
					workcenter: row.workcenter.name,
					workcenter_id: row.workcenter.id,
					workcenter_default: row?.pivot?.workcenter_default || false,
				};
			} else {
				// If a matching object exists, return it without changes
				return existingPivot;
			}
		});

		// Update the pivotState to include the new pivot objects
		setPivotState(newPivotObjects);
	};

	// Delete row by index
	const handleDelete = (index) => {
		try {
			// Make a copy of the existingRows array
			const updatedRows = [...existingRows];

			// Remove the element at the specified index
			updatedRows.splice(index, 1);

			firstIteration.current = false;

			// Update state and trigger onChange
			setExistingRows(updatedRows);

			//onChange(pivotState);
		} catch (e) {
			console.log("ee", e);
		}
	};
	// Select rows from modal
	const handleSelectRows = (selectedRows) => {
		const allRows = [...existingRows, ...selectedRows];
		firstIteration.current = false;
		setExistingRows(allRows);
		setPopup(false);
		//onChange(pivotState);
	};

	const handleSwitch = (i, value, workcenter_id) => {
		// Convert workcenter_id to string for comparison
		const stringWorkcenterId = String(workcenter_id);
		// Find all objects with the given workcenter_id
		const objectsWithSameWorkcenter = pivotState.filter(
			(obj) => String(obj.workcenter_id) === stringWorkcenterId
		);

		// Update workcenter_default to false for all objects with the same workcenter_id
		const updatedPivotState = pivotState.map((obj) => {
			if (objectsWithSameWorkcenter.includes(obj)) {
				return { ...obj, workcenter_default: false };
			}
			return obj;
		});

		// Update workcenter_default to true for the specified index
		updatedPivotState[i] = { ...updatedPivotState[i], workcenter_default: value };

		// Set the new state
		firstIteration.current = false;
		setPivotState(updatedPivotState);

		// Update the parent component after state changes
		//onChange(updatedPivotState);
	};

	// Table columns
	const tableColumns = [
		{
			title: "Code",
			key: "code",
			width: "20%",
			render: (text, record, index) => (
				<>
					<Text>{record.code}</Text>
					{errorsArray[`machines.${index}.machine_id`] && (
						<div>
							<Text type="danger">{errorsArray[`machines.${index}.machine_id`]}</Text>
						</div>
					)}
				</>
			),
		},
		{
			title: "Description",
			key: "description",
			width: "30%",
			render: (text, record, index) => (
				<>
					<Text>{record.description}</Text>
					{errorsArray[`machines.${index}.description`] && (
						<div>
							<Text type="danger">
								{errorsArray[`machines.${index}.description`]}
							</Text>
						</div>
					)}
				</>
			),
		},
		{
			title: "Workcenter",
			key: "workcenter",
			render: (text, record, index) => (
				<>
					<Text type={errorsArray[`machines.${index}.workcenter`] ? "danger" : null}>
						{record.workcenter}
					</Text>
				</>
			),
		},
		{
			title: "Default",
			key: "workcenter_default",
			render: (record, text, index) => (
				<>
					<Switch
						checkedChildren="Yes"
						unCheckedChildren="No"
						value={record?.workcenter_default}
						checked={record?.workcenter_default}
						onChange={(value) => {
							handleSwitch(index, value, record?.workcenter_id);
						}}
					/>
					{errorsArray[`machines.${index}.workcenter_default`] && (
						<div>
							<Text type="danger">
								{errorsArray[`machines.${index}.workcenter_default`]}
							</Text>
						</div>
					)}
				</>
			),
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record, text, index) => (
				<Button
					icon={<IconX color="#e20004" />}
					onClick={() => handleDelete(index)}
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
					title="Select machine"
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
					<TableMachines
						isModal={true}
						actions={false}
						selectable={true}
						filter={{
							columns: {
								code: {
									search: {
										value: _.map(existingRows, "code"),
										operator: "notin",
									},
								},
							},
						}}
						onSelect={(selectedRows) => setSelectedRows(selectedRows)}
						selection="checkbox"
						isAssociation={true}
					/>
				</Modal>
			)}
			<Card
				loading={loading}
				title="Machines"
				extra={[
					<Button
						icon={<IconPlus color="#33855c" />}
						onClick={() => togglePopup()}
						key={"associate"}
					>
						Associate
					</Button>,
				]}
			>
				<Table
					columns={tableColumns}
					dataSource={pivotState}
					loading={loading}
					rowKey={"code"}
					pagination={false}
				/>
				<Alert
					className="mt-2"
					type="info"
					message="Only 1 default machine is allowed per workcenter"
				/>
			</Card>
		</>
	);
};

export default RowsMachines;
