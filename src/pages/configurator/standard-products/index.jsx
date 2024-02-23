import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import {
	getAllStdProducts,
	deleteStdProduct,
	cloneStdProduct,
} from "@/api/configurator/standard-products";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { Row, Col, Space, Button, Modal, Form, message, Tag, Dropdown, Input } from "antd";
const { confirm } = Modal;
import {
	IconSettings2,
	IconPlus,
	IconEdit,
	IconTrash,
	IconPencilMinus,
	IconCopy,
	IconDots,
} from "@tabler/icons-react";
import { useValidationErrors } from "@/hooks/validation-errors";

const Index = () => {
	//Set page permissions
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}
	const [loading, setLoading] = useState(null);
	const [reload, setReload] = useState(0);
	const [selected, setSelected] = useState(null);
	const [popup, setPopup] = useState(false);

	const handleTableChange = async (params) => {
		const result = await getAllStdProducts(params);
		return result.data;
	};

	// Delete action
	const handleDelete = async () => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this product?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteStdProduct(selected?.id);
					if (error) {
						message.error("Error deleting the product");
					} else {
						message.success("Product deleted successfully");
						setReload(reload + 1);
					}
				} catch (error) {
					message.error("An error occurred while deleting the product");
				}
			},
		});
	};

	//Define the action dropdown items, the name of it has to stay items
	const items = [
		{
			key: 1,
			icon: <IconPencilMinus />,
			label: <Link href={`/configurator/standard-products/${selected?.id}`}>Edit</Link>,
		},
		{
			key: 2,
			icon: <IconCopy />,
			label: <a onClick={() => setPopup(!popup)}>Duplicate</a>,
		},
		{
			key: 3,
			danger: true,
			icon: <IconTrash />,
			label: <a onClick={() => handleDelete()}>Delete</a>,
		},
	];

	// Define table columns
	const tableColumns = [
		{
			title: "Name",
			key: "name",
			dataIndex: "name",
			sorter: false,
		},
		{
			title: "Code",
			key: "code",
			sorter: false,
			render: ({ code }) => <Tag>{code}</Tag>,
		},
		{
			title: "Item Group",
			dataIndex: ["item_group", "group_desc"],
			key: "item_group",
			sorter: false,
			render: (group_desc) => group_desc && <Tag>{group_desc}</Tag>,
		},
		{
			title: "Company",
			dataIndex: ["company", "desc"],
			key: "company",
			sorter: false,
			render: (desc) => desc,
		},
		{
			title: "UM",
			dataIndex: ["um", "IDdim"],
			key: "IDdim",
			filterable: false,
			sorter: false,
			render: (IDdim) => IDdim,
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<>
					<Space.Compact>
						<Link
							key={2}
							title="Go to the product configuration"
							href={`/configurator/standard-products/${record.id}/configuration`}
						>
							<Button icon={<IconSettings2 />}>Configure</Button>
						</Link>
						<Dropdown
							menu={{ items }}
							trigger={"click"}
							placement="bottomRight"
							arrow
						>
							<Button
								icon={<IconDots />}
								style={{ padding: 0 }}
								onClick={() => {
									setSelected(record);
								}}
							/>
						</Dropdown>
					</Space.Compact>
				</>
			),
		},
	];

	return (
		<>
			<div className="page">
				<PageActions
					title="Standard Products"
					extra={[
						<Link
							href="/configurator/standard-products/create"
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
						<Col span={24}>
							<Datatable
								fetchData={handleTableChange}
								columns={tableColumns}
								rowKey={(record) => record.code}
								watchStates={[reload]}
							/>
						</Col>
					</Row>
				</div>
			</div>
			{popup && (
				<ModalClone
					opened={popup}
					toggle={() => setPopup(!popup)}
					data={selected}
					reload={() => setReload(reload + 1)}
				/>
			)}
		</>
	);
};

export default Index;

//=============================================================================
// Component Addon
//=============================================================================

const ModalClone = ({ opened, toggle, data, reload }) => {
	const [form] = Form.useForm();
	const formRef = useRef(null);
	const [loading, setLoading] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const validationErrorsBag = useValidationErrors();

	// Action Issue Materials
	const handleSubmit = async (values) => {
		// format the date fields
		setLoading(true);
		const { status, error, validationErrors } = await cloneStdProduct(data?.id, values);
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
				setLoading(false);
			}
			message.error("Error during cloning operation");
			setLoading(false);
		} else {
			message.success("Product cloned successfully.");
			setLoading(false);
			toggle();
			reload();
		}
	};

	return (
		<Modal
			open={opened}
			onCancel={toggle}
			width={"40%"}
			centered
			maskClosable={!isFormChanged}
			transitionName="ant-modal-slide-up"
			title={
				<>
					Enter new code for the duplication of <mark>{data?.code}</mark>
				</>
			}
			footer={[
				<Button
					key={0}
					onClick={toggle}
				>
					Close
				</Button>,
				<Button
					key="submit"
					type="primary"
					htmlType="submit"
					form="form-clone-std"
					loading={loading}
					disabled={!isFormChanged}
				>
					Save
				</Button>,
			]}
		>
			<Form
				onValuesChange={() => setIsFormChanged(true)}
				disabled={loading}
				form={form}
				ref={formRef}
				name="form-clone-std"
				layout="vertical"
				onFinish={handleSubmit}
			>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="code"
							label="New code"
							{...validationErrorsBag.getInputErrors("code")}
							rules={[{ required: true, message: "Required field" }]}
						>
							<Input allowClear />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="prefix"
							label="Cloned constraint code prefix"
							{...validationErrorsBag.getInputErrors("prefix")}
							rules={[{ required: true, message: "Required field" }]}
						>
							<Input allowClear />
						</Form.Item>
					</Col>
				</Row>
			</Form>
		</Modal>
	);
};
