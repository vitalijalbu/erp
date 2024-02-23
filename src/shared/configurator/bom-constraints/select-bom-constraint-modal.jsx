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
import ModalBomConstraint from "./modal-bom-constraint";
import TagSelection from "@/shared/components/tag-selection";

const SelectBomConstraintModal = ({
	opened,
	toggle,
	data,
	reload,
	onSelect,
}) => {
	const [popupConstraint, setPopupConstraint] = useState(null);
	const [selected, setSelected] = useState(null);
	const [row, setRow] = useState(null);
	const [tableReload, setTableReload] = useState(0);
	const [costraintId, setCostraintId] = useState(null);
	const [staticData, setStaticData] = useState([]);

	const toggleConstraintPopup = (record = null) => {
		setRow(record);
		setPopupConstraint(!popupConstraint);
	};

	const handleSelection = (row) => {
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
		if (_.isObject(selected)) {
			onSelect(selected);
			return;
		}
		onSelect(selected.id);
	};

	const title = `Select BOM costraint`;
	useEffect(() => {
		if (data && data["constraint_id"]) {
			setCostraintId(data["constraint_id"]);
			setSelected(data["constraint_id"]);
		}
	}, []);

	// Get Data
	const handleTableChange = async (params) => {
		const filters = {
			"columns[constraint_type][search][value]": "bom",
			...params,
		};
		const result = await getAllConstraints(filters);
		setStaticData(result.data.data);
		return result.data;
	};

	// Define table columns
	const tableColumns = [
		{
			title: "ID",
			key: "id",
			sorter: false,
			render: (record) => <Tag color='blue'>{record.id}</Tag>,
		},
		{
			title: "Label",
			key: "label",
			sorter: false,
		},
		{
			title: "Description",
			key: "description",
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
				<ModalBomConstraint
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
					data["constraint_id"] != null ? (
						<>
							Associated Constraints - <mark>{data["constraint_id"]}</mark>
						</>
					) : (
						"Associated BOM Constraints"
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
						subTitle={
							<TagSelection
								staticKey={true}
								data={staticData}
								selected={costraintId && { id: costraintId, name: costraintId }}
								displayField="name"
								extras={
									<>
										<Button
											icon={<IconPencilMinus />}
											onClick={() =>
												toggleConstraintPopup({ id: costraintId })
											}
											type="text"
											size="small"
										/>
									</>
								}
							/>
						}
						extra={[
							<Button
								key={2}
								disabled={!selected}
								icon={<IconX color="#e20004" />}
								onClick={() => {
									setCostraintId(null);
									setSelected(null);
								}}
							>
								Remove current selection
							</Button>,
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
