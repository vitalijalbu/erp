import React, { useState, useEffect, useCallback } from "react";
import {
	createBOMRuleStdProduct,
	createRoutingStdProduct,
} from "@/api/configurator/standard-products";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Row,
	Col,
	Space,
	Button,
	Form,
	Drawer,
	message,
	InputNumber,
	Modal,
} from "antd";
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";
import SelectRoutingConstraint from "@/shared/form-fields/other/select-routing-constraint";
import SelectRoutingConstraintOperation from "@/shared/form-fields/other/select-routing-constraint-process";

const DrawerRoutingRuleStdProduct = ({
	opened,
	toggle,
	data,
	id,
	reload,
	changesWatcher,
}) => {
	const [form] = Form.useForm();
	const [formChanged, setFormChanged] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [messageApi, contextHolder] = message.useMessage();

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

				console.log(values, "values");
				if (error) {
					if (validationErrors) {
						validationErrorsBag.setValidationErrors(validationErrors);
					}
					messageApi.open({
						type: "error",
						content: "Error during saving operation",
					});
				} else {
					const successMessage = data
						? "BOM Rule Association updated successfully"
						: "BOM Rule Association created successfully";

					messageApi.open({ type: "success", content: successMessage });

					toggle();
					reload();
					changesWatcher(true);
				}
			} catch (error) {
				messageApi.open({
					type: "error",
					content: "Error during saving operation",
				});
			} finally {
				setLoadingAction(false);
			}
		},
		[data, toggle, validationErrorsBag, reload, id]
	);

	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				constraint_id: data?.constraint_id,
				position: data?.position,
			});
		} else {
			form.resetFields();
		}
	}, [data, form]);

	// Close modal confirmation if form state is TRUE
	const handleExit = () => {
		if (formChanged === true) {
			confirm({
				title: "Confirm exit without saving ?",
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
			{contextHolder}
			<Drawer
				open={opened}
				width={800}
				maskClosable={false}
				onClose={handleExit}
				title={
					data
						? `Update Standard Product Routing Rule  #${data.id}`
						: `Create new Standard Product Routing Rule `
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
											rules={[{ required: true }]}
											{...validationErrorsBag.getInputErrors("position")}
										>
											<InputNumber />
										</Form.Item>
									</Col>
								)}

								<Col span={12}>
									<Form.Item
										label='Activation'
										name='activation_constraint_id'
										rules={[{ required: true }]}
										{...validationErrorsBag.getInputErrors(
											"activation_constraint_id"
										)}
									>
										<SelectRoutingConstraint
											value={data?.activation_constraint_id}
											placeHolder='Search Routing Constraint Activation'
											onChange={(value) => {
												form.setFieldValue("id", value?.id);
											}}
										/>
									</Form.Item>
								</Col>
								<Col span={12}>
									<Form.Item
										label='Operation'
										name='process_id'
										rules={[{ required: true }]}
										{...validationErrorsBag.getInputErrors("process_id")}
									>
										<SelectRoutingConstraintOperation
											placeHolder='Search Routing Constraint Process'
											onChange={(value) => {
												form.setFieldValue("id", value?.id || value);
											}}
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

export default DrawerRoutingRuleStdProduct;
