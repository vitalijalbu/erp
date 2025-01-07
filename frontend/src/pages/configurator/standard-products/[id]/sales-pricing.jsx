import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { getStdProduct } from "@/api/configurator/standard-products";
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
	Tooltip,
} from "antd";
import { Collapse } from "antd";

const { confirm } = Modal;
import {
	IconTrash,
	IconPlus,
	IconDeviceFloppy,
	IconArrowDown,
	IconArrowRightTail,
	IconChevronDown,
	IconChevronRight,
	IconPencil,
	IconPencilMinus,
} from "@tabler/icons-react";
import Toolbar from "@/shared/configurator/standard-products/toolbar";
import _ from "lodash";
import DrawerRoutingRuleStdProduct from "@/shared/configurator/pricing-constraints/drawer-routing-rule-std-sales-pricing";
import { createSalesPricingStdProduct } from "@/api/configurator/standard-products";
import SelectPricingConstraint from "@/shared/configurator/pricing-constraints/select-sales-pricing-contraint-modal";
const Routing = () => {
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}

	const router = useRouter();
	const { id } = router.query;

	const [form] = Form.useForm();
	const [data, setData] = useState([]);

	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const [selected, setSelected] = useState(null);
	const [modal, setModal] = useState(false);
	const [constraintPopUp, setConstraintPopUp] = useState(false);
	const [constraint, setConstraint] = useState(false);
	const [editVar, setEditVar] = useState(false);

	const [drawerSalesPrincing, setDrawerSalesPricing] = useState({
		open: false,
		type: null,
	});
	const [reload, setReload] = useState(false);
	const [activeIndex, setActiveIndex] = useState(["0"]);

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
		data.sale_pricing_groups[index].position = value;
		let modded = data.sale_pricing_groups[index];
		data.sale_pricing_groups?.splice(index, 1);
		data.sale_pricing_groups?.splice(0, 0, modded);
		data.sale_pricing_groups?.sort((a, b) => a.position - b.position);

		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});

		// scroll needs to be fixed
		const element = document.getElementById(
			"position-" + _.findIndex(data.sale_pricing_groups, (o) => o.position === value)
		);
		element.scrollIntoView({ behavior: "instant", block: "center" });
	};

	const returnIndex = (id) => {
		const index2 = data?.sale_pricing_groups
			?.map((o) => o.constraints.filter((o2) => o2.id === id))
			?.findIndex((o) => o.length > 0);
		return index2;
	};

	const handleDataSortAccordion = (value, index, record) => {
		const findIndex = returnIndex(record.id);
		data.sale_pricing_groups[findIndex].constraints[index].position = value;
		let modded = data.sale_pricing_groups[findIndex].constraints[index];
		data.sale_pricing_groups?.[findIndex]?.constraints?.splice(index, 1);
		data.sale_pricing_groups?.[findIndex]?.constraints?.splice(0, 0, modded);
		data.sale_pricing_groups?.[findIndex]?.constraints?.sort((a, b) => a.position - b.position);

		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});
	};
	const toggleConstraintPopup = (record = null) => {
		setConstraintPopUp(!constraintPopUp);
		setConstraint(record);
	};
	const handleConstraintSelection = (value) => {
		const headerindex = _.findIndex(data.sale_pricing_groups, (el) => {
			return _.find(el.constraints, (o) => o.id === constraint.id);
		});
		if (headerindex !== -1) {
			const innerIndex = _.findIndex(
				data.sale_pricing_groups[headerindex].constraints,
				(el) => {
					return el.id === constraint.id;
				}
			);
			if (innerIndex !== -1) {
				data.sale_pricing_groups[headerindex].constraints[innerIndex].constraint_id = value;
				setHasChange(true);
			} else {
				message.warning("Update failed. Retry.");
			}
		} else {
			message.warning("Update failed. Retry.");
		}
		toggleConstraintPopup();
	};

	// fill form here based on ID page
	useEffect(() => {
		if (id) {
			setLoading(true);
			getStdProduct(id)
				.then(({ data }) => {
					data?.sale_pricing_groups?.sort((a, b) => a.position - b.position);
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

	const toggleDrawerRoutingRulesToStdProducts = (type, record, edit = false) => {
		if (record !== undefined) {
			setSelected(record);
		}
		if (drawerSalesPrincing.open) {
			setSelected(null);
		}
		setEditVar(edit);
		setDrawerSalesPricing({ open: !drawerSalesPrincing.open, type: type });
	};

	const returnAccordion = (record) => {
		return (
			<>
				<Table
					style={{ paddingLeft: 30 }}
					dataSource={record?.constraints || []}
					columns={tableColumnsAccordion}
					rowKey={(record) => record?.id}
					pagination={false}
					showSorterTooltip={false}
					loading={loading}
					onChange={handleTableChange}
					scroll={{ x: true }}
					width="100%"
				/>
			</>
		);
	};

	// Save Configuration
	const handleSaveConfiguration = async () => {
		setLoadingAction(true);
		const response = await createSalesPricingStdProduct(data.id, {
			sale_pricing: data?.sale_pricing_groups,
		});

		if (response.status !== 200) {
			messageApi.open({
				type: "error",
				content: "An error occurred while saving the Sales Pricing configuration.",
			});
			setLoadingAction(false);
			return;
		}

		setLoadingAction(false);
		messageApi.open({
			type: "success",
			content: "Sales Pricing saved successfully!",
		});

		setReload((reload) => reload + 1);
		setHasChange(false);
	};

	// Delete Routing Rule Associated To Standard Product

	const handleDelete = async (idStdProduct, id) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this Sale Pricing Associated ?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					// filter sale_pricing_groups to remove the one to delete
					const sale_pricing_groups = data?.sale_pricing_groups?.filter(
						(o) => o.id !== id
					);
					const { data: data2, error } = await createSalesPricingStdProduct(
						idStdProduct,
						{ sale_pricing: sale_pricing_groups }
					);
					if (error) {
						let errorMessage =
							"Error deleting the Sales Pricing Rule to Standard Product";
						if (error.status === 422) {
							errorMessage = "The association does not exist or cannot be deleted.";
						}
						messageApi.open({ type: "error", content: errorMessage });
					} else {
						messageApi.open({
							type: "success",
							content: "Sales Pricing to Standard Product deleted successfully",
						});
						setReload(reload + 1);
					}
				} catch (error) {
					messageApi.open({
						type: "error",
						content:
							"An error occurred while deleting the Sales Pricing Rule to Standard Product",
					});
				}
			},
		});
	};

	const handleDelete2 = async (idStdProduct, id, indexGroup) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this Sale Pricing Associated ?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const filtered = data?.sale_pricing_groups?.[indexGroup]?.constraints?.filter(
						(o) => o.id !== id
					);
					data.sale_pricing_groups[indexGroup].constraints = filtered;
					if (data.sale_pricing_groups[indexGroup].constraints.length === 0) {
						data.sale_pricing_groups.splice(indexGroup, 1);
					}
					const { data: data2, error } = await createSalesPricingStdProduct(
						idStdProduct,
						{ sale_pricing: data?.sale_pricing_groups }
					);
					if (error) {
						let errorMessage =
							"Error deleting the Sales Pricing Rule to Standard Product";
						if (error.status === 422) {
							errorMessage = "The association does not exist or cannot be deleted.";
						}
						messageApi.open({ type: "error", content: errorMessage });
					} else {
						messageApi.open({
							type: "success",
							content: "Sales Pricing Rule to Standard Product deleted successfully",
						});
						setReload(reload + 1);
					}
				} catch (error) {
					messageApi.open({
						type: "error",
						content:
							"An error occurred while deleting the Sales Pricing Rule to Standard Product",
					});
				}
			},
		});
	};

	const tableColumns = [
		{
			dataIndex: "position",
			fixex: "left",
			key: "position",
			sorter: (a, b) => a.position - b.position,
			sortIcon: () => <></>,
			sortOrder: sortedInfo.columnKey === "position/" ? sortedInfo.order : "ascend",
			// sortDirections: ["ascend", "descend", "ascend"],
			render: (position, record, index) => {
				const items = [
					{
						key: index,
						children: returnAccordion(record),
						label: (
							<div style={{ display: "flex", flexDirection: "row" }}>
								<div style={{ display: "flex", flexDirection: "column" }}>
									<InputNumber
										id={"position-" + index}
										value={position}
										min={0}
										type="number"
										controls={false}
										onBlur={({ target }) => handleDataSort(target.value, index)}
										style={{ width: 80, marginRight: 10 }}
										onKeyDown={(event) =>
											event.code === "Enter"
												? handleDataSort(event.target.value, index)
												: null
										}
										status={() => (hasErrors.current[index] ? "error" : null)}
									/>
								</div>
								<div style={{ display: "flex", flexDirection: "column" }}>
									<b>{record?.name}</b>
								</div>
							</div>
						),
						extra: (
							<Space.Compact>
								<Button
									icon={<IconPencilMinus />}
									onClick={(e) => {
										e.stopPropagation();
										toggleDrawerRoutingRulesToStdProducts(
											"single",
											record,
											true
										);
									}}
									key={`edit-${index}`}
								>
									Edit
								</Button>
								<Button
									icon={<IconPlus />}
									onClick={(e) => {
										e.stopPropagation();
										toggleDrawerRoutingRulesToStdProducts("single", record);
									}}
									key={`add-${index}`}
								>
									Add Rows
								</Button>
								<Button
									key={`delete-${index}`}
									style={{ color: "red" }}
									// danger
									// type="text"
									icon={<IconTrash />}
									onClick={() =>
										handleDelete(record.standard_product_id, record.id)
									}
								/>
							</Space.Compact>
						),
					},
				];

				return (
					<>
						<Collapse
							items={items}
							defaultActiveKey={activeIndex}
							activeKey={activeIndex}
							onChange={(key) => {
								setActiveIndex(key);
							}}
						/>
					</>
				);
			},
		},
	];

	const tableColumnsAccordion = [
		{
			title: "Position",
			dataIndex: "position",
			key: "position",
			width: "80px",
			render: (position2, record, index) => {
				return (
					<InputNumber
						id={"position2-" + index}
						value={position2}
						min={0}
						type="number"
						controls={false}
						onBlur={({ target }) =>
							handleDataSortAccordion(target.value, index, record)
						}
						onKeyDown={(event) =>
							event.code === "Enter"
								? handleDataSortAccordion(event.target.value, index, record)
								: null
						}
						status={() => (hasErrors.current[index] ? "error" : null)}
					/>
				);
			},
			sorter: (a, b) => a.position - b.position,
			sortOrder: sortedInfo.columnKey === "position/" ? sortedInfo.order : null,
			sortIcon: () => <></>,
		},
		{
			title: "Pricing Constraint",
			dataIndex: "name",
			fixex: "left",
			key: "name",
			render: (text, record, index) => {
				return (
					<Button
						ghost={!!record.constraint_id}
						type={!!record.constraint_id ? "primary" : "default"}
						onClick={() => toggleConstraintPopup(record)}
					>
						{record.constraint_id ? record.constraint_id : "Select"}
					</Button>
				);
				{
					// errorMessage(record, "activation_constraint_id");
				}
				// return <div>{record.constraint_id}</div>;
			},
		},

		{
			title: "Actions",
			key: "actions",
			width: "100px",
			align: "center",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					<Button
						key={3}
						danger
						type="text"
						icon={<IconTrash />}
						onClick={() =>
							handleDelete2(
								record.standard_product_id,
								record.id,
								returnIndex(record.id)
							)
						}
					/>
				</Space.Compact>
			),
		},
	];

	return (
		<>
			{contextHolder}

			{!!drawerSalesPrincing?.open && (
				<DrawerRoutingRuleStdProduct
					opened={drawerSalesPrincing}
					type={drawerSalesPrincing?.type}
					toggle={toggleDrawerRoutingRulesToStdProducts}
					reload={() => {
						setReload(reload + 1);
					}}
					edit={editVar}
					id={id}
					index={data?.sale_pricing_groups?.length}
					record={selected}
					data={data}
					changesWatcher={(value) => setHasChange(value)}
				/>
			)}

			{constraintPopUp && (
				<SelectPricingConstraint
					type={drawerSalesPrincing?.type}
					// disabled={disabled}
					// record={constraint}
					data={{
						["id"]: constraint.constraint_id,
					}}
					onSelect={(value) => handleConstraintSelection(value)}
					opened={constraintPopUp}
					reload={reload}
					toggle={toggleConstraintPopup}
				/>
			)}
			<div className="page">
				<PageActions
					backUrl="/configurator/standard-products"
					title={
						data?.name ? (
							<>
								{" "}
								Sales Pricing - <mark>{data.name}</mark>
							</>
						) : (
							"Configuration"
						)
					}
					extra={[
						<Space key={1}>
							<Button
								type="primary"
								onClick={() => toggleDrawerRoutingRulesToStdProducts("multiple")}
								icon={<IconPlus />}
								/* 	loading={loadingAction} */
							>
								Add Sales Pricing Rule
							</Button>
							<Button
								type="primary"
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
							message="The table has changes. please save before moving away"
							type="warning"
							showIcon
							key={2}
						/>
					)}
					<Toolbar key={3} />
				</PageActions>
				{/* Page Content */}
				<div className="page-content">
					<Row>
						<Col span={24}>
							<Form
								layout="vertical"
								form={form}
								name="form-configuration"
							>
								<Form.Item name="items">
									<div
										style={{
											display: "flex",
											flexDirection: "row",
											marginBottom: 0,
											fontWeight: "bold",
											marginTop: 20,
										}}
									>
										<div
											style={{
												width: "10px",
												marginLeft: 10,
												textAlign: "center",
											}}
										>
											<Tooltip
												title={
													activeIndex?.length > 0
														? "Close All"
														: "Open All"
												}
											>
												{activeIndex.length > 0 ? (
													<IconChevronDown
														style={{ cursor: "pointer" }}
														onClick={() => {
															setActiveIndex([]);
														}}
													/>
												) : (
													<IconChevronRight
														style={{ cursor: "pointer" }}
														onClick={() => {
															setActiveIndex(
																data?.sale_pricing_groups?.map(
																	(_, index) => index.toString()
																)
															);
														}}
													/>
												)}
											</Tooltip>
										</div>
										<div
											style={{
												width: "100px",
												marginLeft: 30,
												textAlign: "center",
											}}
										>
											Position
										</div>
										<div style={{ width: "100%", textAlign: "left" }}>Name</div>
										<div
											style={{
												width: "100px",
												textAlign: "right",
												marginRight: 20,
											}}
										>
											Actions
										</div>
									</div>
									<Table
										dataSource={data?.sale_pricing_groups || []}
										columns={tableColumns}
										showSorterTooltip={false}
										rowKey={(record) => record.activation_constraint_id}
										pagination={false}
										loading={loading}
										onChange={handleTableChange}
										scroll={{ x: true }}
										width="100%"
									/>
								</Form.Item>
							</Form>
						</Col>
					</Row>
					{/* <Row>
						<Col
							span={24}
							style={{ display: "flex", justifyContent: "end" }}
						>
							<Button
								icon={<IconPlus />}
								onClick={() => toggleDrawerRoutingRulesToStdProducts("multiple")}
								key={5}
							>
								Add Sales Pricing Rule
							</Button>
						</Col>
					</Row> */}
				</div>
			</div>
		</>
	);
};

export default Routing;
