import React, { useState, useEffect, useCallback } from "react";
import { createSalesPricingStdProduct } from "@/api/configurator/standard-products";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Row, Col, Space, Button, Form, Drawer, message, InputNumber, Modal, Input } from "antd";
const { confirm } = Modal;
import { IconAlertCircle } from "@tabler/icons-react";
import SelectSalesPricing from "@/shared/form-fields/other/select-sales-pricing-constraint";

const DrawerSalesPricingRuleStdProduct = ({
	opened,
	index,
	toggle,
	data,
	record,
	type,
	id,
	edit = false,
	reload,
	changesWatcher,
}) => {
	const [form] = Form.useForm();
	const [formChanged, setFormChanged] = useState(false);
	const [loadingAction, setLoadingAction] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [messageApi, contextHolder] = message.useMessage();
	console.log(id);
	const handleSubmit = useCallback(
		async (values) => {
			setLoadingAction(true);
			try {
				const dataTemp = data.sale_pricing_groups;

				if (type === "multiple") {
					dataTemp.push({
						name: values.name,
						position: values.position,
						constraints: values.constraints?.map((el, index) => {
							return {
								position: index,
								constraint_id: el,
							};
						}),
					});
				} else {
					const index = dataTemp.findIndex((el) => el.id === record.id);
					const dataTempElement = dataTemp[index];
					if (!edit) {
						const myPosition =
							Number(
								dataTempElement.constraints?.[
									dataTempElement.constraints?.length - 1
								]?.position
							) + 1;
						dataTempElement.constraints?.push({
							position: myPosition,
							constraint_id: values.constraints,
						});
					} else {
						dataTempElement.name = values.name;
						dataTempElement.position = values.position;
					}
				}
				// Create new configuration
				const { status, error, validationErrors } = await createSalesPricingStdProduct(id, {
					sale_pricing: dataTemp,
				});
				if (error) {
					if (validationErrors) {
						validationErrorsBag.setValidationErrors(validationErrors);
					}
					messageApi.open({
						type: "error",
						content: "Error during saving operation",
					});
					dataTemp.pop();
				} else {
					const successMessage = data
						? "Sales Pricing Rule Association created successfully"
						: "Sales Pricing Rule Association created successfully";

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
						size="24"
						className="anticon"
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
	const getDrawerTitle = () => {
		if (edit) {
			return "Edit Sales Pricing Rule - " + record?.name;
		} else {
			return type === "multiple"
				? "Create New Standard Product Sales Pricing Rule"
				: "Add Sales Pricing Rule - " + record?.name;
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
				title={getDrawerTitle()}
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
								<Col span={12}>
									<Form.Item
										label="Name"
										name="name"
										initialValue={record?.name}
										{...validationErrorsBag.getInputErrors(
											`sale_pricing.${index}.name`,
											true
										)}
									>
										<Input disabled={record?.id && !edit} />
									</Form.Item>
								</Col>

								<Col span={12}>
									<Form.Item
										label="Position"
										initialValue={record?.position}
										name="position"
										{...validationErrorsBag.getInputErrors(
											`sale_pricing.${index}.position`,
											true
										)}
									>
										<InputNumber disabled={record?.id && !edit} />
									</Form.Item>
								</Col>

								<Col span={12}>
									<Form.Item
										label="Sales Pricing Constraint"
										name="constraints"
										{...validationErrorsBag.getInputErrors(
											`sale_pricing.${index}.constraints`,
											true
										)}
										hidden={id && edit}
									>
										<SelectSalesPricing
											value={data?.id}
											placeHolder="Search Sales Pricing Constraint"
											type={type}
											record={record}
											data={data}
											onChange={(value) => {
												form.setFieldValue("id", value?.id);
											}}
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
											{record?.name ? "Add" : "Create"}
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

export default DrawerSalesPricingRuleStdProduct;
