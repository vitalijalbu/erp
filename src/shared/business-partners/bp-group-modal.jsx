import { IconCheckbox, IconPencilMinus, IconPlus } from "@tabler/icons-react";
import { Button, Col, Modal, Row, Space } from "antd";
import React, { useEffect, useState } from "react";
import ModalGroup from "./modal-group";
import Datatable from "../datatable/datatable";
import { getAllBPGroups } from "@/api/bp";
import PageActions from "../components/page-actions";
import TagSelection from "../components/tag-selection";

const BpGroupModal = (props) => {
	const [popupGroup, setPopupGroup] = useState(false);
	const [selected, setSelected] = useState(null);
	const [editItem, setEditItem] = useState(null);
	const [localReload, setLocalReload] = useState(0);
	const [groupIds, setGroupIds] = useState([]);
	const [staticData, setStaticData] = useState([]);

	useEffect(() => {
		setGroupIds(_.isArray(props.selectedData) ? props.selectedData : [props.selectedData]);
		setSelected(props.selectedData);
	}, []);

	const toggleGroupPopup = (record = null) => {
		setEditItem(record);
		setPopupGroup(!popupGroup);
	};

	const handleTableChange = async (params) => {
		const result = await getAllBPGroups(params);
		setStaticData(result.data.data)
		return result.data;
	};
	const handleModalSave = (value) => {
		setSelected(value.id);
		setGroupIds([value.id]);
	};
	const handleSelection = () => {
		props.onSelect(selected);
	};

	const tableColumns = [
		{
			title: "Name",
			key: "name",
			dataIndex: "name",
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					<Button
						icon={<IconPencilMinus />}
						onClick={() => toggleGroupPopup(record)}
					>
						Edit
					</Button>
				</Space.Compact>
			),
		},
	];
	return (
		<>
			{popupGroup && (
				<ModalGroup
					opened={popupGroup}
					toggle={toggleGroupPopup}
					data={editItem ?? null}
					reload={() => setLocalReload(localReload + 1)}
					onModalSave={(value) => handleModalSave(value)}
				/>
			)}
			<Modal
				open={props.open} // Use visible instead of open
				onCancel={() => props.onTogglePopUp()}
				width="40%"
				transitionName="ant-modal-slide-up"
				className="modal-fullscreen"
				title="Business Partners Groups"
				centered
				maskClosable={false}
				footer={[
					<Button
						key={0}
						onClick={() => props.onTogglePopUp()}
					>
						Close
					</Button>,
					<Button
						key={1}
						type="primary"
						htmlType="submit"
						icon={<IconCheckbox />}
						onClick={() => handleSelection()}
						// disabled={!selected}
					>
						Select
					</Button>,
				]}
			>
				<div className="page">
					<PageActions
						// title="Business Partners Groups"
						subTitle={
							<TagSelection
								staticKey={true}
								data={staticData}
								selected={selected && { id: selected, name: selected }}
								displayField="name"
								extras={
									<>
										<Button
											icon={<IconPencilMinus />}
											onClick={() => toggleConstraintPopup({ id: selected })}
											type="text"
											size="small"
										></Button>
									</>
								}
							/>
						}
						extra={[
							<Button
								key={0}
								type="primary"
								icon={<IconPlus />}
								onClick={() => toggleGroupPopup()}
							>
								Add new
							</Button>,
						]}
					></PageActions>

					<div className="page-content">
						<Row>
							<Col
								span={24}
								className="mb-3"
							>
								<Datatable
									fetchData={handleTableChange}
									columns={tableColumns}
									watchStates={[localReload]}
									rowKey={(record) => record.id}
									rowSelection={{
										type: "radio",
										fixed: true,
										preserveSelectedRowKeys: false,
										selectedRowKeys: groupIds,
										onChange: (selectedRowKeys, selectedRows) => {
											// props?.onSelect(selectedRows);
											setGroupIds(_.map(selectedRows, "id"));
											// setRow(null)
											setSelected(selectedRows[0].id);
										},
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

export default BpGroupModal;
