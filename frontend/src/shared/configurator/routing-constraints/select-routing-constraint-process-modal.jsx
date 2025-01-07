import React, { useState, useEffect } from "react";
import { getAllConstraints } from "@/api/configurator/constraints";
import Datatable from "@/shared/datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { Tag, Button, Row, Col, Modal } from "antd";
import {
	IconCheckbox,
	IconPencilMinus,
	IconPlus,
	IconX,
} from "@tabler/icons-react";
import ModalRoutingProcess from "./modal-routing-process";
import { getAllProcesses } from "@/api/processes/processes";
const SelectBomConstraintModal = ({
	opened,
	toggle,
	data,
	reload,
	onSelect,
	returnOnlyId,
}) => {
	const [popupConstraint, setPopupConstraint] = useState(null);
	const [selected, setSelected] = useState(null);
	const [row, setRow] = useState(null);
	const [tableReload, setTableReload] = useState(0);
	const [costraintId, setCostraintId] = useState(null);

	const toggleConstraintPopup = (record = null) => {
		setRow(record);
		setPopupConstraint(!popupConstraint);
	};

	const handleSelection = (row) => {
		console.log(row, "row");
		setSelected(row);
	};

	const handleModalSave = (val) => {
		if (val && !val.is_draft) {
			setSelected(val);
			setCostraintId(val.id);
			setTableReload(tableReload + 1);
		} else {
			setSelected(selected);
			setCostraintId(costraintId);
			setTableReload(tableReload + 1);
		}
	};

	const onSave = () => {
		console.log(selected, "selected");
		if (_.isObject(selected)) {
			if (returnOnlyId) onSelect(selected.id);
			else onSelect(selected);
		} else onSelect(selected.id);
	};

	const title = `Select Activation Routing costraint yet again`;
	useEffect(() => {
		if (data && (data["process_id"] || data["id"])) {
			setCostraintId(data["process_id"] || data["id"]);
			setSelected(data["process_id"] || data["id"]);
		}
	}, []);

	// Get Data
	const handleTableChange = async (params) => {
		const result = await getAllProcesses();
		return result.data;
	};

	// Define table columns
	const tableColumns = [
		{
			title: "Code",
			key: "id",
			sorter: false,
			render: (record) => <Tag color='blue'>{record.id}</Tag>,
		},
		{
			title: "Name",
			key: "name",
			sorter: false,
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Button
					icon={<IconPencilMinus />}
					onClick={() => toggleConstraintPopup(record)}
				>
					Edit
				</Button>
			),
		},
	];

	return (
		<>
			{popupConstraint && (
				<ModalRoutingProcess
					opened={popupConstraint}
					toggle={toggleConstraintPopup}
					data={row || null}
					onSave={(val) => handleModalSave(val)}
				/>
			)}
			<Modal
				key={3}
				open={opened}
				destroyOnClose={true}
				onCancel={toggle}
				title={
					data["process_id"] != null ? (
						<>
							Associated Constraints - <mark>{data["process_id"]}</mark>
						</>
					) : (
						"Associated Routing Constraints"
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
								type="primary"
								key={4}
								icon={<IconPlus />}
								onClick={() => toggleConstraintPopup()}
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
									rowClassName={(record) => record.is_draft && "disabled-row"}
									rowSelection={{
										type: "radio",
										onChange: (selectedRowKeys, selectedRows) => {
											setCostraintId(selectedRows[0].id);
											handleSelection(selectedRows[0]);
										},
										getCheckboxProps: (record) => ({
											id: record.id,
											disabled: record.is_draft,
										}),
										selectedRowKeys: [costraintId],
									}}
								/>
							</Col>
						</Row>
					</div>
				</div>
			</Modal>
		</>
	);
};

export default SelectBomConstraintModal;
