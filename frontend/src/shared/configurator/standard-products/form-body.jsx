import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import {
	getStdProduct,
	createStdProduct,
	updateStdProduct,
	deleteStdProduct,
} from "@/api/configurator/standard-products";
import PageActions from "@/shared/components/page-actions";
import SelectCompany from "@/shared/form-fields/select-company";
import SelectItemGroup from "@/shared/form-fields/items/select-item-group";
import SelectUM from "@/shared/form-fields/select-um";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Row,
	Col,
	Button,
	Modal,
	Form,
	Card,
	Input,
	message,
	Space,
	FloatButton,
	Tooltip,
} from "antd";
const { confirm } = Modal;
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "./toolbar";
import SelectConstraintModal from "@/shared/configurator/configuration/select-constraint-modal";

const FormBody = () => {
	// Set page permissions
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}

	const router = useRouter();
	const { id } = router.query;
	const validationErrorsBag = useValidationErrors();

	const [form] = Form.useForm();
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(0);
	const [data, setData] = useState({});
	const [company, setCompany] = useState(null);

	// description constraint selection
	const [popupDescriptionConstraint, setPopupDescriptionConstraint] =
		useState(null);
	const [selectedDescription, setSelectedDescription] = useState(null);

	const [popupLongDescriptionConstraint, setPopupLongDescriptionConstraint] =
		useState(null);
	const [selectedLongDescription, setSelectedLongDescription] = useState(null);

	const [popupProductionConstraint, setPopupProductionConstraint] =
		useState(null);
	const [selectedProduction, setSelectedProduction] = useState(null);

	const constraintDescriptionTooltip =
		"The selected constraint must contain a 'return' instruction containing a string with the description to apply";

	// Fill form here based on ID page
	useEffect(() => {
		if (id) {
			setLoading(true);
			getStdProduct(id)
				.then(({ data }) => {
					// Fill form here
					form.setFieldsValue({
						name: data?.name,
						code: data?.cde,
						company_id: data?.company_id,
						item_group_id: data?.item_group_id,
						um_id: data?.um_id,
						description_constraint_id: data?.description_constraint_id,
						long_description_constraint_id:
							data?.long_description_constraint_id,
						production_description_constraint_id:
							data?.production_description_constraint_id,
					});
					setData(data);
					setCompany(data?.company_id);
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [id]);

	// Submit form
	const handleSubmit = async (values) => {
		setLoading(true);
		validationErrorsBag.clear();

		try {
			const { error, data, validationErrors } = id
				? await updateStdProduct(id, values)
				: await createStdProduct(values);
			if (error) {
				if (validationErrors) {
					validationErrorsBag.setValidationErrors(validationErrors);
				}
				message.error("Error during saving operation");
				setLoading(false);
			} else {
				const successMessage = id
					? "Standard product updated successfully"
					: "Standard product  created successfully";
				message.success(successMessage);
				router.push("/configurator/standard-products");
				setLoading(false);
			}
		} catch (error) {
			console.error("An error occurred:", error);
		}
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
					const { data, error } = await deleteStdProduct(id);
					if (error) {
						message.error("Error deleting the product");
					} else {
						message.success("Product deleted successfully");
						router.push("/configurator/standard-products");
					}
				} catch (error) {
					message.error("An error occurred while deleting the product");
				}
			},
		});
	};

	const handleCompanyChange = (value) => {
		form.resetFields(["item_group_id"]);
		setCompany(value);
		form.setFieldValue("company_id", value);
	};

	// toggle popup to selecct modal constraints
	const toggleDescriptionConstraintPopup = (record = null) => {
		setSelectedDescription(record);
		setPopupDescriptionConstraint(!popupDescriptionConstraint);
	};

	const toggleLongDescriptionConstraintPopup = (record = null) => {
		setSelectedLongDescription(record);
		setPopupLongDescriptionConstraint(!popupLongDescriptionConstraint);
	};

	const toggleProductionConstraintPopup = (record = null) => {
		setSelectedProduction(record);
		setPopupProductionConstraint(!popupProductionConstraint);
	};

	// Handle Select Constraint
	const handleDescriptionSelect = (func) => {
		data.description_constraint_id = func;
		form.setFieldsValue({
			description_constraint_id: func,
		});
		setIsFormChanged(true);
		toggleDescriptionConstraintPopup(selectedDescription);
	};

	const handleLongDescriptionSelect = (func) => {
		data.long_description_constraint_id = func;
		form.setFieldsValue({
			long_description_constraint_id: func,
		});
		setIsFormChanged(true);
		toggleLongDescriptionConstraintPopup(selectedDescription);
	};

	const handleProductDescriptionPopup = (func) => {
		data.production_description_constraint_id = func;
		form.setFieldsValue({
			production_description_constraint_id: func,
		});
		setIsFormChanged(true);
		toggleProductionConstraintPopup(selectedProduction);
	};

	return (
		<div className='page'>
			<PageActions
				backUrl='/configurator/standard-products'
				loading={loading}
				title={
					id ? (
						<>
							Update standard product - <mark>{data?.name}</mark>
						</>
					) : (
						"Add new standard product"
					)
				}
				extra={[
					<Button
						key={0}
						htmlType='submit'
						type='primary'
						loading={loading}
						form='form-product'
						disabled={!isFormChanged}
					>
						Save
					</Button>,
					id && (
						<Button
							key={2}
							icon={<IconTrash />}
							danger
							onClick={handleDelete}
						>
							Delete
						</Button>
					),
				]}
			>
				{id && <Toolbar key={1} />}
			</PageActions>

			<div className='page-content'>
				{popupDescriptionConstraint && (
					<SelectConstraintModal
						opened={popupDescriptionConstraint}
						toggle={toggleDescriptionConstraintPopup}
						data={selectedDescription ?? null}
						reload={() => setReload(reload + 1)}
						onSelect={handleDescriptionSelect}
						title={
							<>
								Associated Description Constraints - <mark>{data?.id}</mark>
							</>
						}
					/>
				)}
				{popupLongDescriptionConstraint && (
					<SelectConstraintModal
						opened={popupLongDescriptionConstraint}
						toggle={toggleLongDescriptionConstraintPopup}
						data={selectedLongDescription ?? null}
						reload={() => setReload(reload + 1)}
						onSelect={handleLongDescriptionSelect}
						title={
							<>
								Associated Long Description Constraints -{" "}
								<mark>{data?.id}</mark>
							</>
						}
					/>
				)}

				{popupProductionConstraint && (
					<SelectConstraintModal
						opened={popupProductionConstraint}
						toggle={toggleProductionConstraintPopup}
						data={selectedProduction ?? null}
						reload={() => setReload(reload + 1)}
						onSelect={handleProductDescriptionPopup}
						title={
							<>
								Associated Product Description Constraints -{" "}
								<mark>{data?.id}</mark>
							</>
						}
					/>
				)}

				<Row gutter={16}>
					<Col span={24}>
						<Card
							title='Standard product details'
							loading={loading}
						>
							<Form
								layout='vertical'
								form={form}
								onFinish={handleSubmit}
								name='form-product'
								onValuesChange={() => setIsFormChanged(true)}
							>
								<Row gutter={16}>
									<Col span={12}>
										<Form.Item
											label='Name'
											name='name'
											// rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("name")}
										>
											<Input allowClear />
										</Form.Item>
									</Col>
									{!id && (
										<Col span={12}>
											<Form.Item
												label='Code'
												name='code'
												// rules={[{ required: true }]}
												{...validationErrorsBag.getInputErrors("code")}
											>
												<Input allowClear />
											</Form.Item>
										</Col>
									)}
									<Col span={12}>
										<Form.Item
											label='Company'
											name='company_id'
											// rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("company_id")}
										>
											<SelectCompany
												withShared={false}
												onChange={(value) => handleCompanyChange(value)}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label='Product Type'
											name='item_group_id'
											// rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("item_group_id")}
										>
											<SelectItemGroup
												withShared={true}
												company={company}
												keyName={"item_group"}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label='UM'
											name='um_id'
											// rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("um_id")}
										>
											<SelectUM />
										</Form.Item>
									</Col>

									<Col span={12}>
										<Form.Item
											label='Description generation constraint'
											name='description_constraint_id'
											// rules={[{ required: false }]}
											tooltip={constraintDescriptionTooltip}
											{...validationErrorsBag.getInputErrors(
												"description_constraint_id"
											)}
										>
											<Button
												ghost={!!data?.description_constraint_id}
												type={
													!!data?.description_constraint_id
														? "primary"
														: "default"
												}
												onClick={() =>
													toggleDescriptionConstraintPopup(
														Object?.assign(data || {}, {
															...data,
															subtype: "value",
															value_constraint_id:
																data?.description_constraint_id,
														})
													)
												}
											>
												{data?.description_constraint_id || "Select"}
											</Button>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label='Long Description generation constraint'
											name='long_description_constraint_id'
											// rules={[{ required: false }]}
											tooltip={constraintDescriptionTooltip}
											{...validationErrorsBag.getInputErrors(
												"long_description_constraint_id"
											)}
										>
											<Button
												ghost={!!data?.long_description_constraint_id}
												type={
													!!data?.long_description_constraint_id
														? "primary"
														: "default"
												}
												onClick={() =>
													toggleLongDescriptionConstraintPopup(
														Object.assign(data, {
															...data,
															subtype: "value",
															value_constraint_id:
																data?.long_description_constraint_id,
														})
													)
												}
											>
												{data?.long_description_constraint_id || "Select"}
											</Button>
										</Form.Item>
									</Col>

									<Col span={12}>
										<Form.Item
											label='Production text generation constraint'
											name='production_description_constraint_id'
											// rules={[{ required: false }]}
											tooltip={constraintDescriptionTooltip}
											{...validationErrorsBag.getInputErrors(
												"production_description_constraint_id"
											)}
										>
											<Button
												ghost={!!data?.production_description_constraint_id}
												type={
													!!data?.production_description_constraint_id
														? "primary"
														: "default"
												}
												onClick={() =>
													toggleProductionConstraintPopup(
														Object.assign(data, {
															...data,
															subtype: "value",
															value_constraint_id:
																data?.production_description_constraint_id,
														})
													)
												}
											>
												{data?.production_description_constraint_id || "Select"}
											</Button>
										</Form.Item>
									</Col>
								</Row>
							</Form>
						</Card>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default FormBody;
