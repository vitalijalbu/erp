import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import { getAllConstraints } from "@/api/configurator/constraints";
import {
	createFeatureStdProduct,
	createRoutingStdProduct,
	doProcessCall,
} from "@/api/configurator/standard-products";
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
import SelectRoutingConstraint from "@/shared/form-fields/other/select-routing-constraint";
import SelectRoutingConstraintOperation from "@/shared/form-fields/other/select-routing-constraint_operation";
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
	const [formChanged, setFormChanged] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [reloadAction, setReloadAction] = useState(0);

	useEffect(() => {
		const fetchData = async () => {
			const res = await doProcessCall();
			console.log(res.data);
		};
		fetchData();
	}, []);

	const handleSubmit = useCallback(
		async (values) => {
			setLoadingAction(true);
			try {
				let status, error, validationErrors;

				// Create new configuration
				({ status, error, validationErrors } = await createRoutingStdProduct(
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
						? "Routing Association updated successfully"
						: "Routing Association created successfully";
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
						? `Update Routing Standard Product #${data.id}`
						: `Create Routing Standard Product `
				}
			>
				<Row gutter={16}>
					<Col span={24}>
						<Form
							form={form}
							layout='vertical'
							onFinish={handleSubmit}
							onValuesChange={() => setFormChanged(true)}
						>
							<Row gutter={16}>
								{!data && (
									<Col span={12}>
										<Form.Item
											label='Position'
											name='position'
											
											{...validationErrorsBag.getInputErrors("position")}
										>
											<InputNumber />
										</Form.Item>
									</Col>
								)}
								<Col span={12}>
									<Form.Item
										label='Operation'
										name='process_id'
										
										{...validationErrorsBag.getInputErrors("feature_id")}
									>
										<Input name='operation' />
									</Form.Item>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col span={12}>
									<Form.Item
										label='Activation Constraint'
										name='activation_constraint_id'
										{...validationErrorsBag.getInputErrors(
											"dataset_constraint_id"
										)}
									>
										<SelectRoutingConstraintOperation
											placeHolder='Search Dataset Constraint'
											onChange={(value) =>
												handleSelectChange(value, "dataset_constraint_id")
											}
										/>
									</Form.Item>
								</Col>
							</Row>

							<Row>
								<Col span={24}>
									<Space
										wrap
										className='footer-actions'
									>
										<Button onClick={handleExit}>Close</Button>
										<Button
											type='primary'
											htmlType='submit'
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
