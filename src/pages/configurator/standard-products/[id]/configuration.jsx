import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import {
	createBulkFeatures,
	getStdProduct,
	deleteFeatureAssociatedStdProduct,
} from "@/api/configurator/standard-products";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Row,
	Col,
	Space,
	Button,
	Alert,
	Modal,
	Table,
	Form,
	Switch,
	message,
	InputNumber,
} from "antd";
const { confirm } = Modal;
import { IconTrash, IconPlus, IconDeviceFloppy, IconAB2 } from "@tabler/icons-react";
import DrawerFeatureStdProduct from "@/shared/configurator/configuration/drawer-feature-std-product";
import SelectConstraintModal from "@/shared/configurator/configuration/select-constraint-modal";
import Toolbar from "@/shared/configurator/standard-products/toolbar";
import _ from "lodash";
import ModalConfigurator from "@/shared/components/modal-configurator";
import { columnsProductSellerConfigurator } from "@/data/column-standard-product-bp";
import SelectFeatureAttribute from "@/shared/form-fields/configurator/select-feature-attribute";
import { getAllFeatureAttributes } from "@/api/configurator/features";
import { errorMessage, setErrorsFunction } from "@/hooks/error-handlers";

const Configuration = () => {
	//Set page permissions
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
	const [disabledFeatures, setDisabledFeatures] = useState([]); // disable features from select
	const [modal, setModal] = useState(false);
	const [modalTableBP, setModalTableBP] = useState(false);
	const [drawerFeatureToStdProduct, setdrawerFeatureToStdProduct] = useState(false);
	const [reload, setReload] = useState(false);
	const [attributes, setAttributes] = useState([]);
	const [disabledAttributes, setDisabledAttributes] = useState([]); // disable attributes from select

	const [sortedInfo, setSortedInfo] = useState({
		order: "ascend",
		columnKey: "position",
	});

	const hasErrors = useRef({});
	const [hasChanges, setHasChange] = useState(false);
	const validationErrorsBag = useValidationErrors();

	const [messageApi, contextHolder] = message.useMessage();

	const handleTableChange = (pagination, filters, sorter) => {
		setSortedInfo(sorter);
	};

	const handleDataSort = (value, index) => {
		// add pull and push index
		data.configuration_features[index].position = value;
		let modded = data.configuration_features[index];
		data.configuration_features.splice(index, 1);
		data.configuration_features.splice(0, 0, modded);

		data.configuration_features.sort((a, b) => a.position - b.position);
		// setData(data)
		hasErrors.current[index] = false;
		setHasChange(true);
		setSortedInfo({
			order: "ascend",
			columnKey: "position",
		});

		// scroll need to be fixed
		const element = document.getElementById(
			"position-" + _.findIndex(data.configuration_features, (o) => o.position === value)
		);
		element.scrollIntoView({ behavior: "instant", block: "center" });
	};

	// fill form here based on ID page
	useEffect(() => {
		if (id) {
			setLoading(true);
			getStdProduct(id)
				.then(({ data }) => {
					data?.configuration_features.sort((a, b) => a.position - b.position);
					//set data state
					setData(data);
					form.setFieldValue("item", data.configuration_features);
					const featureIds = _.compact(_.map(data?.configuration_features, "feature_id"));
					setDisabledFeatures(featureIds);
					//set disabled attributes
					const attributeIds = _.compact(
						_.map(data?.configuration_features, "feature_attribute_id")
					);
					setDisabledAttributes(attributeIds);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			form.resetFields();
			setData(null);
		}
	}, [id, form, reload]);

	// set item state array
	useEffect(() => {
		getAllFeatureAttributes().then(({ data, error }) => {
			if (!error) {
				setAttributes(data || []);

				setLoading(false);
			} else {
				message.error("An error occurred while fetching API");
				setLoading(false);
			}
		});
	}, []);

	// toggle popup to selecct modal constraints
	const toggleConstraintPopup = (record = null) => {
		setSelected(record);
		setPopupConstraint(!popupConstraint);
	};

	useEffect(() => {
		console.log(selected);
	}, [selected]);
	// Handle Select Constraint
	const handleSelect = (func) => {
		console.log(func, data.configuration_features, selected);
		// Handle function selection
		data.configuration_features.find((o) => o.id === selected.id)[
			selected.subtype + "_constraint_id"
		] = func;
		console.log(func, selected);
		setHasChange(true);
		// close the modal
		toggleConstraintPopup(selected);
	};

	const handleSwitchToggle = (value, index, type) => {
		data.configuration_features[index][type] = value;
		form.setFieldsValue({ items: data.configuration_features });
		setHasChange(true);
	};

	// Select Attribute
	const handleChangeAttribute = (value, index) => {
		const oldValue = _.clone(data.configuration_features[index].feature_attribute_id);
		data.configuration_features[index].feature_attribute_id = value;

		// Update the form fields
		form.setFieldsValue({ feature_attribute_id: value });
		setHasChange(true);

		if (value) {
			setDisabledAttributes([...disabledAttributes, value]);
		} else {
			setDisabledAttributes(_.without(disabledAttributes, oldValue));
		}
	};

	// toggle drawer for create new feature to std product
	const toggleDrawerFeaturesToStdProducts = (record) => {
		if (record) {
			setSelected(record);
		} else {
			setSelected(null);
		}
		setdrawerFeatureToStdProduct(!drawerFeatureToStdProduct);
	};

	// Save Configuration
	const handleSaveConfiguration = async () => {
		setLoadingAction(true);
		const featuresToCreate = data?.configuration_features.map((feature) => {
			// Remove id  from each feature
			const { id, ...featuresNoId } = feature;
			return featuresNoId;
		});

		const response = await createBulkFeatures(data.id, {
			productConfigurationFeature: featuresToCreate,
		});
		// TODO make message mo excplicative
		if (response.status !== 200) {
			messageApi.open({
				type: "error",
				content: "An error occurred while saving the configuration.",
			});
			if (response.error) {
				console.log(response);
				data.configuration_features = setErrorsFunction(response.validationErrors, data.configuration_features);
				setData(data)
			}
			setLoadingAction(false);
			return;
		}
		setLoadingAction(false);
		messageApi.open({
			type: "success",
			content: "Configuration saved successfully!",
		});

		setReload((reload) => reload + 1);
		setHasChange(false);
	};

	//Delete Feature Associated To Standard Product
	const handleDelete = async (idStdProduct, id) => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this Feature Associated?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteFeatureAssociatedStdProduct(
						idStdProduct,
						id
					);
					if (error) {
						let errorMessage = "Error deleting the Feature to Standard Product";
						if (error.status === 422) {
							errorMessage = "The association does not exist or cannot be deleted.";
						}
						messageApi.open({ type: "error", content: errorMessage });
					} else {
						messageApi.open({
							type: "success",
							content: "Feature to Standard Product deleted successfully",
						});
						setReload(reload + 1);
					}
				} catch (error) {
					messageApi.open({
						type: "error",
						content: "An error occurred while deleting the Feature to Standard Product",
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
			sortOrder: sortedInfo.columnKey === "position" ? sortedInfo.order : null,
			sortIcon: () => <></>,
		},
		{
			title: "Feature",
			dataIndex: "feature",
			fixed: "left",
			key: "feature",
			// width:'250px',
			render: (text, record, index) => {
				return (
					<>
						<div className="text-bold">{text.label}</div>
						<div className="text-xsmall">{text.id}</div>
					</>
				);
			},
		},
		{
			title: "Feat. attribute",
			width: "10%",
			key: "feature_attribute_id",
			render: (text, record, index) => (
				<>
					<SelectFeatureAttribute
						options={attributes}
						disabledData={disabledAttributes}
						defaultValue={record.feature_attribute_id}
						onChange={(value) => handleChangeAttribute(value, index)}
					/>
					{errorMessage(record, "feature_attribute_id")}
				</>
			),
		},
		{
			title: "Read Only",
			dataIndex: "readonly",
			key: "readonly",
			sorter: false,
			render: (text, record, index) => {
				return (
					<>
						<Switch
							checkedChildren="Yes"
							unCheckedChildren="No"
							defaultChecked={_.isEqual(record.readonly, "1")}
							onChange={(value) => handleSwitchToggle(value, index, "readonly")}
						/>
						{errorMessage(record, "readonly")}
					</>
				);
			},
		},
		{
			title: "Hidden",
			key: "hidden",
			sorter: false,
			render: (text, record, index) => {
				return (
					<>
						<Switch
							checkedChildren="Yes"
							unCheckedChildren="No"
							defaultChecked={_.isEqual(record.hidden, "1")}
							onChange={(value) => handleSwitchToggle(value, index, "hidden")}
						/>
						{errorMessage(record, "hidden")}
					</>
				);
			},
		},
		{
			title: "Multiple",
			key: "multiple",
			sorter: false,
			render: (text, record, index) => {
				return (
					<>
						<Switch
							checkedChildren="Yes"
							unCheckedChildren="No"
							defaultChecked={_.isEqual(record.multiple, "1")}
							onChange={(value) => handleSwitchToggle(value, index, "multiple")}
						/>
						{errorMessage(record)}
					</>
				);
			},
		},
		{
			title: "Validation",
			key: "validation_constraint_id",
			sorter: false,
			width: "8%",
			render: (record) => (
				<>
					<Button
						ghost={!!record.validation_constraint_id}
						type={!!record.validation_constraint_id ? "primary" : "default"}
						onClick={() => {
							console.log(record);
							toggleConstraintPopup(
								Object.assign(record, { ...record, subtype: "validation" })
							);
						}}
					>
						{record.validation_constraint_id
							? record.validation_constraint_id
							: "Select"}
					</Button>
					{errorMessage(record, "validation_constraint_id")}
				</>
			),
		},
		{
			title: "Value",
			key: "value_constraint_id",
			sorter: false,
			width: "8%",
			render: (record) => (
				<>
					<Button
						ghost={!!record.value_constraint_id}
						type={!!record.value_constraint_id ? "primary" : "default"}
						onClick={() =>
							toggleConstraintPopup(
								Object.assign(record, { ...record, subtype: "value" })
							)
						}
					>
						{record.value_constraint_id ? record.value_constraint_id : "Select"}
					</Button>
					{errorMessage(record, "value_constraint_id")}
				</>
			),
		},
		{
			title: "Dataset",
			key: "dataset_constraint_id",
			sorter: false,
			width: "8%",
			render: (record) => (
				<>
					<Button
						ghost={!!record.dataset_constraint_id}
						type={!!record.dataset_constraint_id ? "primary" : "default"}
						onClick={() =>
							toggleConstraintPopup(
								Object.assign(record, { ...record, subtype: "dataset" })
							)
						}
					>
						{record.dataset_constraint_id ? record.dataset_constraint_id : "Select"}
					</Button>
					{errorMessage(record, "dataset_constraint_id")}
				</>
			),
		},
		{
			title: "Activation",
			key: "activation_constraint_id",
			sorter: false,
			width: "8%",
			render: (record) => (
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
							? record.activation_constraint_id
							: "Select"}
					</Button>
					{errorMessage(record, "activation_constraint_id")}
				</>
			),
		},
		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					{/* <Button type="primary" onClickCapture={() => handleSaveRow(record)}>
            Save
          </Button> */}
					<Button
						key={3}
						danger
						type="text"
						icon={<IconTrash />}
						onClick={() => handleDelete(record.standard_product_id, record.id)}
					/>
				</Space.Compact>
			),
		},
	];

	return (
		<>
			{contextHolder}
			{popupConstraint && (
				<SelectConstraintModal
					opened={popupConstraint}
					toggle={toggleConstraintPopup}
					data={selected ?? null}
					reload={() => setReload(reload + 1)}
					onSelect={handleSelect}
					title={
						<>
							Associated Constraints - <mark>{data.id}</mark>
						</>
					}
				/>
			)}
			{!!drawerFeatureToStdProduct && (
				<DrawerFeatureStdProduct
					opened={drawerFeatureToStdProduct}
					toggle={toggleDrawerFeaturesToStdProducts}
					reload={() => {
						setReload(reload + 1);
					}}
					id={id}
					changesWatcher={(value) => setHasChange(value)}
					disabled_features={disabledFeatures}
					disabledAttributes={disabledAttributes}
				/>
			)}

			<div className="page">
				<PageActions
					backUrl="/configurator/standard-products"
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
						<Space>
							<Button
								disabled={
									hasChanges ||
									!data?.configuration_features ||
									data?.configuration_features.length <= 0
								}
								onClick={() => {
									setModal(true);
									setModalTableBP(true);
								}}
								key={2}
								type="primary"
								// loading={!!modal && businessPartner.length===0}
								icon={<IconAB2 />}
							>
								Test Configuration
							</Button>
							<Button
								type="primary"
								onClick={handleSaveConfiguration}
								disabled={!hasChanges}
								key={1}
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
							message="The table has changes. please save before move away"
							type="warning"
							showIcon
						/>
					)}
					<Toolbar />
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
									<Table
										dataSource={data?.configuration_features || []}
										columns={tableColumns}
										rowKey={(record) => record.id}
										pagination={false}
										loading={loading}
										onChange={handleTableChange}
										scroll={{ x: true }}
										width="100%"
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
								onClick={toggleDrawerFeaturesToStdProducts}
								key={5}
							>
								Add Standard Product Feature
							</Button>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default Configuration;
