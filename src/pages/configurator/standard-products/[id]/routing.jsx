import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
	getStdProduct,
	createBulkRoutingRules,
	deleteRoutingRuleAssociatedStdProduct,
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
import { IconTrash, IconPlus, IconDeviceFloppy } from "@tabler/icons-react";
import SelectRoutingConstraintModal from "@/shared/configurator/routing-constraints/select-routing-constraint-modal";
import Toolbar from "@/shared/configurator/standard-products/toolbar";
import _ from "lodash";
import ModalConfigurator from "@/shared/components/modal-configurator";
import DrawerRoutingRuleStdProduct from "@/shared/configurator/routing-constraints/drawer-routing-rule-std-product";
import { errorMessage, setErrorsFunction } from "@/hooks/error-handlers";

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

	const [popupConstraint, setPopupConstraint] = useState(null);
	const [popupConstraintProcess, setPopupConstraintProcess] = useState(null);
	const [selected, setSelected] = useState(null);
	const [modal, setModal] = useState(false);

	const [drawerRoutingRuleToStdProduct, setDrawerRoutingRuleToStdProduct] =
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
		data.routings[index].position = value;
		let modded = data.routings[index];
		data.routings?.splice(index, 1);
		data.routings?.splice(0, 0, modded);
		data.routings?.sort((a, b) => a.position - b.position);

		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});

		// scroll needs to be fixed
		const element = document.getElementById(
			"position-" + _.findIndex(data.routings, (o) => o.position === value)
		);
		element.scrollIntoView({ behavior: "instant", block: "center" });
	};

	// fill form here based on ID page
	useEffect(() => {
		if (id) {
			setLoading(true);
			getStdProduct(id)
				.then(({ data }) => {
					data?.routings?.sort((a, b) => a.position - b.position);
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
		const routingRules = data?.routings?.find(
			(o) => o.activation_constraint_id === selected.activation_constraint_id
		);
		if (obj !== undefined) {
			console.log(routingRules);
			routingRules["activation_constraint_id"] = obj.id;
			routingRules["activation_constraint"] = obj;
		} else {
			routingRules["activation_constraint_id"] = null;
			routingRules["activation_constraint"] = null;
		}
		setHasChange(true);
		toggleConstraintPopup(selected);
	};

	const handleSelectProcess = async (obj) => {
		const routingRules = data?.routings?.find(
			(o) => o.process_id === selectedProcess.process_id
		);
		if (obj !== undefined) {
			routingRules["process_id"] = obj.id;
			routingRules["process"] = obj;
		} else {
			routingRules["process_id"] = null;
			routingRules["process"] = null;
		}
		setHasChange(true);
		toggleConstraintPopupProcess(selectedProcess);
	};

	// toggle drawer for create new Routing rule to std product
	const toggleDrawerRoutingRulesToStdProducts = (record) => {
		if (record) {
			setSelected(record);
		} else {
			setSelected(null);
		}
		setDrawerRoutingRuleToStdProduct(!drawerRoutingRuleToStdProduct);
	};

	// Save Configuration
	const handleSaveConfiguration = async () => {
		setLoadingAction(true);

		const routesToCreate = data?.routings?.map((routing) => {
			// Remove id from each routing
			const { id, ...routingNoId } = routing;
			return routingNoId;
		});

		const response = await createBulkRoutingRules(data.id, {
			routings: routesToCreate,
		});

		if (response.status !== 200) {
			messageApi.open({
				type: "error",
				content: "An error occurred while saving the Routing configuration.",
			});
			if (response.error) {
				console.log(response);
				data.routings = setErrorsFunction(response.validationErrors, data.routings);
				setData(data);
			}
			setLoadingAction(false);
			return;
		}

		setLoadingAction(false);
		messageApi.open({
			type: "success",
			content: "Routing Configuration saved successfully!",
		});

		setReload((reload) => reload + 1);
		setHasChange(false);
	};

	// Delete Routing Rule Associated To Standard Product
	const handleDelete = async (idStdProduct, id) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this Routing Associated ?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteRoutingRuleAssociatedStdProduct(
						idStdProduct,
						id
					);
					if (error) {
						let errorMessage =
							"Error deleting the Routing Rule to Standard Product";
						if (error.status === 422) {
							errorMessage =
								"The association does not exist or cannot be deleted.";
						}
						messageApi.open({ type: "error", content: errorMessage });
					} else {
						messageApi.open({
							type: "success",
							content: "Routing Rule to Standard Product deleted successfully",
						});
						setReload(reload + 1);
					}
				} catch (error) {
					messageApi.open({
						type: "error",
						content:
							"An error occurred while deleting the Routing Rule to Standard Product",
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

			width: "80px",
			render: (position, record, index) => (
				<>
					<InputNumber
						id={"position-" + index}
						value={position}
						min={0}
						type="number"
						controls={false}
						onBlur={({ target }) => handleDataSort(target.value, index)}
						onKeyDown={(event) =>
							event.code === "Enter"
								? handleDataSort(event.target.value, index)
								: null
						}
						status={() => (hasErrors.current[index] ? "error" : null)}
					/>
					{errorMessage(record, "position")}
				</>
			),
			sorter: (a, b) => a.position - b.position,
			sortOrder: sortedInfo.columnKey === "position/" ? sortedInfo.order : null,
			sortIcon: () => <></>,
		},
		{
			title: "Process",
			dataIndex: "process_id",
			fixex: "left",
			key: "constraint",
			render: (text, record, index) => {
				return (
					<>
						<>
							<div className="text-bold">{record?.process?.name}</div>
							<div className="text-xsmall">{record?.process?.code}</div>
						</>
					</>
				);
			},
		},

		{
			title: "Activation",
			dataIndex: "activation_constraint_id",
			key: "activation_constraint_id",
			render: (text, record, index) => {
				return (
					<>
						<Button
							ghost={!!record.activation_constraint_id}
							type={!!record.activation_constraint_id ? "primary" : "default"}
							onClick={() =>
								toggleConstraintPopup(
									Object.assign(record, { ...record, subtype: "activation" })
								)
							}
						>
							{record.activation_constraint_id
								? record.activation_constraint.label
								: "Select"}
						</Button>
						{errorMessage(record, "activation_constraint_id")}
					</>
				);
			},
		},

		{
			title: "Actions",
			key: "actions",
			width: "100px",
			align: "center",
			className: "table-actions",
			render: (record) => (
				<>
					<Space.Compact>
						<Button
							key={3}
							danger
							type="text"
							icon={<IconTrash />}
							onClick={() => handleDelete(record.standard_product_id, record.id)}
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
				<SelectRoutingConstraintModal
					opened={popupConstraint}
					toggle={toggleConstraintPopup}
					data={selected ?? null}
					reload={() => setReload(reload + 1)}
					onSelect={handleSelect}
					title={
						<>
							Associated Routing Constraints - <mark>{data.id}</mark>
						</>
					}
				/>
			)}

			{!!drawerRoutingRuleToStdProduct && (
				<DrawerRoutingRuleStdProduct
					opened={drawerRoutingRuleToStdProduct}
					toggle={toggleDrawerRoutingRulesToStdProducts}
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
								Routing - <mark>{data.name}</mark>
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
										dataSource={data?.routings || []}
										columns={tableColumns}
										rowKey={(record) => record.activation_constraint_id}
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
								onClick={toggleDrawerRoutingRulesToStdProducts}
								key={5}
							>
								Add Standard Product Routing
							</Button>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default Routing;
