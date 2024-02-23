import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
	getStdProduct,
	deleteBOMRuleAssociatedStdProduct,
	createBulkBOMRules,
} from "@/api/configurator/standard-products";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import {
	Row,
	Col,
	Space,
	Button,
	Alert,
	Modal,
	Table,
	Form,
	message,
	InputNumber,
} from "antd";
const { confirm } = Modal;
import {
	IconTrash,
	IconPlus,
	IconDeviceFloppy,
	IconPencilMinus,
} from "@tabler/icons-react";
import DrawerBOMRuleStdProduct from "@/shared/configurator/bom-constraints/drawer-bom-rule-std-product";
import SelectBomConstraintModal from "@/shared/configurator/bom-constraints/select-bom-constraint-modal";
import Toolbar from "@/shared/configurator/standard-products/toolbar";
import _ from "lodash";
import ModalConfigurator from "@/shared/components/modal-configurator";

const Bom = () => {
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}

	const router = useRouter();
	const { id } = router.query;

	const [form] = Form.useForm();
	const [data, setData] = useState([]);

	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);

	const [popupConstraint, setPopupConstraint] = useState(null);
	const [selected, setSelected] = useState(null);
	const [modal, setModal] = useState(false);

	const [drawerBOMRuleToStdProduct, setDrawerBOMRuleToStdProduct] =
		useState(false);
	const [reload, setReload] = useState(false);

	const [sortedInfo, setSortedInfo] = useState({
		order: "ascend",
		columnKey: "position",
	});

	const hasErrors = useRef({});

	const [hasChanges, setHasChange] = useState(false);

	const [messageApi, contextHolder] = message.useMessage();

	const handleTableChange = (pagination, filters, sorter) => {
		setSortedInfo(sorter);
	};

	const handleDataSort = (value, index) => {
		data.b_o_m_rules[index].position = value;
		let modded = data.b_o_m_rules[index];
		data.b_o_m_rules?.splice(index, 1);
		data.b_o_m_rules?.splice(0, 0, modded);

		data.b_o_m_rules?.sort((a, b) => a.position - b.position);

		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});

		// scroll needs to be fixed
		const element = document.getElementById(
			"position-" + _.findIndex(data.b_o_m_rules, (o) => o.position === value)
		);
		element.scrollIntoView({ behavior: "instant", block: "center" });
	};

	// fill form here based on ID page
	useEffect(() => {
		if (id) {
			setLoading(true);
			getStdProduct(id)
				.then(({ data }) => {
					data?.b_o_m_rules?.sort((a, b) => a.position - b.position);
					setData(data);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			form.resetFields();
			setData(null);
		}
	}, [id, form, reload]);

	// toggle popup to selecct modal constraints
	const toggleConstraintPopup = (record = null) => {
		setSelected(record);
		setPopupConstraint(!popupConstraint);
	};

	// Handle Select Constraint
	const handleSelect = async (obj) => {
		const bomRule = data.b_o_m_rules.find((o) => o.id === selected.id);

		if (obj !== undefined) {
			bomRule["constraint_id"] = obj.id;
			bomRule["constraint"]["id"] = obj.id;
			bomRule["constraint"]["label"] = obj.label;
		} else {
			bomRule["constraint_id"] = selected.constraint_id;
		}

		setHasChange(true);
		toggleConstraintPopup(selected);
	};

	// toggle drawer for create new BOM rule to std product
	const toggleDrawerBOMRulesToStdProducts = (record) => {
		if (record) {
			setSelected(record);
		} else {
			setSelected(null);
		}
		setDrawerBOMRuleToStdProduct(!drawerBOMRuleToStdProduct);
	};

	// Save Configuration
	const handleSaveConfiguration = async () => {
		setLoadingAction(true);

		const bomRulesToCreate = data?.b_o_m_rules?.map((bom) => {
			// Remove id from each BOM
			const { id, ...bomsNoId } = bom;
			return bomsNoId;
		});

		const response = await createBulkBOMRules(data.id, {
			BOMRules: bomRulesToCreate,
		});

		if (response.status !== 200) {
			messageApi.open({
				type: "error",
				content: "An error occurred while saving the BOM configuration.",
			});
			setLoadingAction(false);
			return;
		}

		setLoadingAction(false);
		messageApi.open({
			type: "success",
			content: "BOM Configuration saved successfully!",
		});

		setReload((reload) => reload + 1);
		setHasChange(false);
	};

	// Delete BOM Rule Associated To Standard Product
	const handleDelete = async (idStdProduct, id) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this BOM Rule Associated ?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteBOMRuleAssociatedStdProduct(
						idStdProduct,
						id
					);
					if (error) {
						let errorMessage =
							"Error deleting the BOM Rule to Standard Product";
						if (error.status === 422) {
							errorMessage =
								"The association does not exist or cannot be deleted.";
						}
						messageApi.open({ type: "error", content: errorMessage });
					} else {
						messageApi.open({
							type: "success",
							content: "BOM Rule to Standard Product deleted successfully",
						});
						setReload(reload + 1);
					}
				} catch (error) {
					messageApi.open({
						type: "error",
						content:
							"An error occurred while deleting the BOM Rule to Standard Product",
					});
				}
			},
		});
	};

	const tableColumns = [
		{
			title: "Position",
			dataIndex: "position",
			key: "position",
			fixed: "left",
			width: "80px",
			render: (position, record, index) => (
				<InputNumber
					id={"position-" + index}
					value={position}
					min={0}
					type='number'
					controls={false}
					onBlur={({ target }) => handleDataSort(target.value, index)}
					onKeyDown={(event) =>
						event.code === "Enter"
							? handleDataSort(event.target.value, index)
							: null
					}
					status={() => (hasErrors.current[index] ? "error" : null)}
				/>
			),
			sorter: (a, b) => a.position - b.position,
			sortOrder: sortedInfo.columnKey === "position/" ? sortedInfo.order : null,
			sortIcon: () => <></>,
		},
		{
			title: "BOM Rule",
			dataIndex: "constraint",
			fixed: "left",
			key: "constraint",
			render: (text, record, index) => {
				return (
					<>
						<div className='text-bold'>{record.constraint.label}</div>
						<div className='text-xsmall'>{record.constraint.id}</div>
					</>
				);
			},
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<>
					<Space.Compact>
						<Button
							key={4}
							type='text'
							icon={<IconPencilMinus />}
							onClick={() => toggleConstraintPopup(record)}
						/>
					</Space.Compact>
					<Space.Compact>
						<Button
							key={3}
							danger
							type='text'
							icon={<IconTrash />}
							onClick={() =>
								handleDelete(record.standard_product_id, record.id)
							}
						/>
					</Space.Compact>
				</>
			),
		},
	];

	return (
		<>
			{contextHolder}
			{popupConstraint && (
				<SelectBomConstraintModal
					opened={popupConstraint}
					toggle={toggleConstraintPopup}
					data={selected ?? null}
					reload={() => setReload(reload + 1)}
					onSelect={handleSelect}
					title={
						<>
							Associated BOM Constraints - <mark>{data.id}</mark>
						</>
					}
				/>
			)}

			{!!drawerBOMRuleToStdProduct && (
				<DrawerBOMRuleStdProduct
					opened={drawerBOMRuleToStdProduct}
					toggle={toggleDrawerBOMRulesToStdProducts}
					reload={() => {
						setReload(reload + 1);
					}}
					id={id}
					changesWatcher={(value) => setHasChange(value)}
				/>
			)}

			<div className='page'>
				<PageActions
					backUrl='/configurator/standard-products'
					title={
						data?.name ? (
							<>
								Configuration - <mark>{data.name}</mark>
							</>
						) : (
							"Configuration"
						)
					}
					extra={[
						<Space key={1}>
							<Button
								type='primary'
								onClick={handleSaveConfiguration}
								disabled={!hasChanges}
								icon={<IconDeviceFloppy />}
								loading={loadingAction}
							>
								Save Configuration
							</Button>
						</Space>,
					]}
				>
					{hasChanges && (
						<Alert
							message='The table has changes. please save before moving away'
							type='warning'
							showIcon
							key={2}
						/>
					)}
					<Toolbar key={3} />
				</PageActions>
				{/* Page Content */}
				<div className='page-content'>
					<Row>
						<Col span={24}>
							<Form
								layout='vertical'
								form={form}
								name='form-configuration'
							>
								<Form.Item name='items'>
									<Table
										dataSource={data?.b_o_m_rules || []}
										columns={tableColumns}
										rowKey={(record) => record.id}
										pagination={false}
										loading={loading}
										onChange={handleTableChange}
										scroll={{ x: true }}
										width='100%'
									/>
								</Form.Item>
								{modal && (
									<ModalConfigurator
										product={data?.code}
										productName={data?.name}
										form={form}
										toggleModal={setModal}
										visible={modal}
									/>
								)}
							</Form>
						</Col>
					</Row>
					<Row>
						<Col
							span={24}
							style={{ display: "flex", justifyContent: "end" }}
						>
							<Button
								icon={<IconPlus />}
								onClick={toggleDrawerBOMRulesToStdProducts}
								key={5}
							>
								Add Standard Product BOM Rule
							</Button>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default Bom;
