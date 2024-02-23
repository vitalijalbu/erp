import React, { useState } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Modal, Row, Space, Typography, message } from "antd";
import { IconPencilMinus, IconTrash, IconPlus } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { deleteMachine, getAllMachines } from "@/api/machines/machines";
const { confirm } = Modal;

const Index = ({ selectable, onSelect, isModal }) => {
	// Set page permissions
	// TODO: change with final ones
	if (!UserPermissions.authorizePage("machines.management")) {
		return false;
	}

	const [popupMachine, setPopupMachine] = useState(null);
	const [selected, setSelected] = useState(null);
	const [reload, setReload] = useState(0);

	const toggleMachinePopup = (record = null) => {
		setSelected(record);
		setPopupMachine(!popupMachine);
	};

	const handleTableChange = async (filters) => {
		const response = await getAllMachines(filters);
		return response.data;
	};

	const handleDelete = async (id) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this machine?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error, errorMsg } = await deleteMachine(id);
					if (error) {
						message.error(errorMsg);
					} else {
						message.success("Machine deleted successfully");
						setReload(reload + 1);
					}
				} catch (error) {
					message.error("An error occurred while deleting the Machine");
				}
			},
		});
	};

	// Table columns
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
			render: (cost) => (
				<Typography.Text>
					{cost.item} - {cost.item_desc}
				</Typography.Text>
			),
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
				<Space.Compact>
					{!isModal ? (
						<Link
							title="Edit Machine"
							href={`/machines/${record.id}`}
						>
							<Button icon={<IconPencilMinus />}>Edit</Button>
						</Link>
					) : (
						<Button
							icon={<IconPencilMinus />}
							onClick={() => toggleMachinePopup(record)}
						>
							Edit
						</Button>
					)}

					<Button
						danger
						icon={<IconTrash />}
						onClick={() => handleDelete(record.id)}
					/>
				</Space.Compact>
			),
		},
	];

	return (
		<>
			<div className="page">
				<PageActions
					key={1}
					title={`Machines`}
					extra={[
						<Link
							href="/machines/create"
							key="1"
						>
							<Button
								type="primary"
								icon={<IconPlus />}
							>
								Add new
							</Button>
						</Link>,
					]}
				/>
				<div className="page-content">
					<Row>
						<Col
							span={24}
							className="mb-3"
						>
							<Datatable
								columns={tableColumns}
								fetchData={handleTableChange}
								rowKey={(record) => record.id}
								watchStates={[reload]}
							/>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default Index;
