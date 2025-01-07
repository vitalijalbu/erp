import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { getAllConstraints } from "@/api/configurator/constraints";
import { createFeatureStdProduct } from "@/api/configurator/standard-products";
import { getAllFeatures } from "@/api/configurator/features";
import ModalFeature from "./modal-feature";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectFeature from "@/shared/form-fields/other/select-feature";
import {
	Row,
	Col,
	Space,
	Button,
	Form,
	Drawer,
	Input,
	Select,
	message,
	Tag,
	Switch,
	Card,
	Modal,
	InputNumber,
} from "antd";
import { IconPlus, IconAlertCircle } from "@tabler/icons-react";
import SelectWithModal from "@/shared/components/select-with-modal";
import SelectConstraint from "@/shared/form-fields/other/select-costraint";
import _ from "lodash";
import SelectFeatureAttribute from "@/shared/form-fields/configurator/select-feature-attribute";
const { confirm } = Modal;

//=============================================================================
// Component Drawer
//=============================================================================

const DrawerFeatureStdProduct = ({
	opened,
	toggle,
	data,
	id,
	reload,
	changesWatcher,
	disabled_features,
	disabledAttributes,
}) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [formChanged, setFormChanged] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [reloadAction, setReloadAction] = useState(0);
	const [popupFeature, setPopupFeature] = useState(null);
	const [selected, setSelected] = useState(null);

	const router = useRouter();

	const handleSubmit = useCallback(
		async (values) => {
			setLoadingAction(true);
			try {
				let status, error, validationErrors;

				// Create new configuration
				({ status, error, validationErrors } = await createFeatureStdProduct(
					id,
					values
				));

				if (error) {
					if (validationErrors) {
						validationErrorsBag.setValidationErrors(validationErrors);
					}
					message.error("Error during saving operation");
				} else {
					const successMessage = data
						? "Feature Association updated successfully"
						: "Feature Association created successfully";
					message.success(successMessage);
					toggle();
					reload();
					changesWatcher(true);
				}
			} catch (error) {
				message.error("Error during saving operation");
			} finally {
				setLoadingAction(false);
			}
		},
		[data, toggle, validationErrorsBag, reload, id]
	);

	const handleSelectChange = (value, field) => {
		form.setFieldValue(field, value);
	};

	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				feature_id: data.feature_id,
				position: data?.position,
				readonly: data?.readonly,
				hidden: data?.hidden,
				multiple: data?.multiple,
				validation_constraint_id: data?.validation_constraint_id,
				value_constraint_id: data?.value_constraint_id,
				dataset_constraint_id: data?.dataset_constraint_id,
				activation_constraint_id: data?.activation_constraint_id,
			});
		} else {
			form.resetFields();
		}
	}, [data, form]);

	//Close modal confirmation if form state is TRUE
	const handleExit = () => {
		if (formChanged === true) {
			confirm({
				title: "Confirm exit without saving?",
				icon: (
					<IconAlertCircle
						color={"#faad14"}
						size='24'
						className='anticon'
					/>
				),
				transitionName: "ant-modal-slide-up",
				content: "Seems like you forgot to save your edits",
				okText: "Exit",
				okType: "danger",
				cancelText: "Cancel",
				onOk() {
					toggle();
					reload();
				},
			});
		} else {
			toggle();
			reload();
		}
	};

	return (
		<>
			<Drawer
				open={opened}
				width={800}
				maskClosable={false}
				onClose={handleExit}
				title={
					data
						? `Update Standard Product Feature  #${data.id}`
						: `Create new Standard Product Feature `
				}
			>
				<Row gutter={16}>
					<Col span={24}>
						<Form
							form={form}
							layout="vertical"
							onFinish={handleSubmit}
							onValuesChange={() => setFormChanged(true)}
						>
							<Row gutter={16}>
								{!data && (
									<Col span={12}>
										<Form.Item
											label="Position"
											name="position"
											// rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("position")}
										>
											<InputNumber />
										</Form.Item>
									</Col>
								)}
								<Col span={12}>
									<Form.Item
										label="Feature"
										name="feature_id"
										// rules={[{ required: true }]}
										{...validationErrorsBag.getInputErrors("feature_id")}
									>
										<SelectFeature
											disabledOptions={disabled_features}
											reload={reloadAction}
											onChange={(value) =>
												handleSelectChange(value, "feature_id")
											}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Feature attribute"
										name="feature_attribute_id"
										// rules={[{ required: true }]}
										{...validationErrorsBag.getInputErrors(
											"feature_attribute_id"
										)}
									>
										<SelectFeatureAttribute disabledData={disabledAttributes} />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col span={8}>
									<Form.Item
										label="Read Only"
										name="readonly"
										{...validationErrorsBag.getInputErrors("readonly")}
										valuePropName="checked"
									>
										<Switch
											checkedChildren="Yes"
											unCheckedChildren="No"
										/>
									</Form.Item>
								</Col>
								<Col span={8}>
									<Form.Item
										label="Hidden"
										name="hidden"
										{...validationErrorsBag.getInputErrors("hidden")}
										valuePropName="checked"
									>
										<Switch
											checkedChildren="Yes"
											unCheckedChildren="No"
										/>
									</Form.Item>
								</Col>

								<Col span={8}>
									<Form.Item
										label="Multiple"
										name="multiple"
										{...validationErrorsBag.getInputErrors("multiple")}
										valuePropName="checked"
									>
										<Switch
											checkedChildren="Yes"
											unCheckedChildren="No"
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										label="Validation Constraint"
										name="validation_constraint_id"
										{...validationErrorsBag.getInputErrors(
											"validation_constraint_id"
										)}
									>
										<SelectConstraint
											constraintType="validation"
											placeHolder="Search Validation Constraint"
											onChange={(value) =>
												handleSelectChange(
													value,
													"validation_constraint_id"
												)
											}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Value Constraint"
										name="value_constraint_id"
										{...validationErrorsBag.getInputErrors(
											"value_constraint_id"
										)}
									>
										<SelectConstraint
											constraintType="value"
											onChange={(value) =>
												handleSelectChange(value, "value_constraint_id")
											}
											placeHolder="Search Value Constraint"
										/>
									</Form.Item>
								</Col>
							</Row>
							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										label="Dataset Constraint"
										name="dataset_constraint_id"
										{...validationErrorsBag.getInputErrors(
											"dataset_constraint_id"
										)}
									>
										<SelectConstraint
											constraintType="dataset"
											placeHolder="Search Dataset Constraint"
											onChange={(value) =>
												handleSelectChange(value, "dataset_constraint_id")
											}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label="Activation Constraint"
										name="activation_constraint_id"
										{...validationErrorsBag.getInputErrors(
											"activation_constraint_id"
										)}
									>
										<SelectConstraint
											constraintType="activation"
											onChange={(value) =>
												handleSelectChange(
													value,
													"activation_constraint_id"
												)
											}
											placeHolder="Search Activation Constraint"
										/>
									</Form.Item>
								</Col>
							</Row>

							<Row>
								<Col span={24}>
									<Space
										wrap
										className="footer-actions"
									>
										<Button onClick={handleExit}>Close</Button>
										<Button
											type="primary"
											htmlType="submit"
											loading={loadingAction}
											disabled={!formChanged}
										>
											{data ? "Update" : "Create"}
										</Button>
									</Space>
								</Col>
							</Row>
						</Form>
					</Col>
				</Row>
			</Drawer>
		</>
	);
};

export default DrawerFeatureStdProduct;
