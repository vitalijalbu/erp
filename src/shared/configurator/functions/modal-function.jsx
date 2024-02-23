import React, { useState, useEffect, useCallback } from "react";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getFunctionById, createFunction, updateFunction } from "@/api/configurator/functions";
import { Tag, Divider, Button, Row, Col, Form, Modal, Spin, Input, message } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import {
	IconAlertCircle,
	IconBug,
	IconDownload,
	IconPlug,
	IconPlus,
	IconTrash,
} from "@tabler/icons-react";
import SelectFunction from "@/shared/form-fields/other/select-function-category";
import ModalFunctionTest from "./modal-function-test";
import dynamic from "next/dynamic";
import _, { uniqueId } from "lodash";
import { destroyBlocklyOrphans } from "@/hooks/helper-functions";

const Editor = dynamic(() => import("@/shared/blockly/editor"), { ssr: false });

const ModalFunction = ({ opened, toggle, data, reload, onCreated }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const [blocklyJson, setBlocklyJson] = useState({});
	const [DataArguments, setDataArguments] = useState([]);
	const [popupTestFunction, setPopupTestFunction] = useState(null);
	const [selected, setSelected] = useState(null);
	// const [blocklyParams, setBlocklyParams] = useState([]);
	const [jsonValidate, setJsonValidate] = useState(true);
	const [formChanged, setFormChanged] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [idFunctionCreated, setIdFunctionCreated] = useState(data?.id);
	const [formName, setFormName] = useState(null);

	const togglePopup = () => {
		setPopupTestFunction(!popupTestFunction);
	};

	const fetchFunction = async () => {
		getFunctionById(data?.id || form.getFieldValue("id"))
			.then(({ data }) => {
				setIdFunctionCreated(data?.id);
				setDataArguments(data?.arguments);
				setBlocklyJson(_.get(data, "body", {}));

				form.setFieldsValue({
					label: data.label,
					id: data.id,
					description: data.description,
					arguments: data.arguments,
					custom_function_category_id: data.custom_function_category_id ?? undefined,
				});
				setFormChanged(false);
			})
			.catch((error) => {
				message.error("Error fetching function data:");
			})
			.finally(() => {
				setLoading(false);
			});
	};

	useEffect(() => {
		if (data) {
			setLoading(true);
			fetchFunction();
		} else {
			form.resetFields();
		}
	}, [data, form]);

	useEffect(() => {
		setFormName("function-form" + "-" + _.uniqueId());
	}, []);

	const handleModalClose = async () => {
		await destroyBlocklyOrphans();
		toggle();
	};

	// Form Submit
	const handleSubmit = async (values, testing = false) => {
		setLoading(true);

		if (!jsonValidate) {
			setLoading(false);
			message.error(
				"Some of the Blocks insert has empty value! Please check that all inputs are filled and retry."
			);
			return;
		}

		const body = { ...values, body: blocklyJson };

		try {
			let response;
			if (idFunctionCreated) {
				const { id, ...updateBody } = body;
				response = await updateFunction(idFunctionCreated, updateBody);
			} else {
				response = await createFunction(body);
			}

			if (response.error) {
				const { validationErrors } = response;
				if (validationErrors) {
					validationErrorsBag.setValidationErrors(validationErrors);
				}
				message.error(
					response.error?.response?.data?.message || "Error during data fetching"
				);
			} else {
				const successMessage = idFunctionCreated
					? "Function updated successfully"
					: "Function created successfully";
				message.success(successMessage);

				if (!data && onCreated) {
					onCreated(response.data);
				}
				if (!testing) {
					handleModalClose();
					reload();
				} else {
					fetchFunction().then(() => {
						togglePopup();
						setFormChanged(false);
					});
				}
			}
		} catch (error) {
			message.error("Error during data fetching");
		} finally {
			setLoading(false);
		}
	};

	const handleEditorChange = useCallback((updatedState) => {
		setBlocklyJson(updatedState);
		setFormChanged(true);
		form.setFieldsValue({ body: updatedState });
	}, []);

	// send arguments to editor from form.
	const handleParamsChange = () => {
		return _.filter(form.getFieldValue("arguments"), (o) => !_.isEmpty(o));
	};

	const handleExit = () => {
		if (formChanged === true) {
			confirm({
				title: "Confirm exit without saving?",
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
					handleModalClose();
					setFormChanged(false);
				},
			});
		} else {
			handleModalClose();
		}
	};

	const handleTest = () => {
		if (formChanged) {
			confirm({
				title: "To test the function it must be saved",
				icon: (
					<IconAlertCircle
						color={"#faad14"}
						size="24"
						className="anticon"
					/>
				),
				transitionName: "ant-modal-slide-up",
				content: "Seems like you forgot to save your edits, Do want to save?",
				okText: "Save",
				okType: "danger",
				cancelText: "Cancel",
				onOk() {
					handleSubmit(form.getFieldsValue(), true);
				},
			});
		} else {
			togglePopup();
		}
	};

	return (
		<>
			{popupTestFunction && (
				<ModalFunctionTest
					opened={popupTestFunction}
					toggle={togglePopup}
					argumentsData={DataArguments}
					idFunction={data?.id || form.getFieldValue("id")}
				/>
			)}
			<Modal
				open={opened}
				destroyOnClose={true}
				onCancel={handleExit}
				title={
					data ? (
						<>
							Update function - <mark>{data.id}</mark>
						</>
					) : (
						"Create new function"
					)
				}
				width="100%"
				styles={{body:{ height: "100%", padding: "20px 30px 40px" }}}
				maskClosable={false}
				className="modal-fullscreen modal-fixed-footer"
				centered
				transitionName="ant-modal-slide-up"
				icon={<IconDownload />}
				footer={[
					<Button
						key={2}
						onClick={handleTest}
						icon={<IconBug />}
						type="dashed"
					>
						Test
					</Button>,
					<Button
						key={0}
						onClick={handleExit}
					>
						Close
					</Button>,
					<Button
						loading={loading}
						key={1}
						type="primary"
						htmlType="submit"
						form={formName}
						disabled={!formChanged}
					>
						Save
					</Button>,
				]}
			>
				<div className="page-content">
					<Spin spinning={loading}>
						<Form
							layout="vertical"
							form={form}
							name={formName}
							onFinish={handleSubmit}
							onValuesChange={() => setFormChanged(true)}
						>
							<Row gutter={16}>
								<Col
									span={20}
									xl={20}
									md={24}
									sm={24}
								>
									<Form.Item>
										<Editor
											state={blocklyJson}
											onSave={handleEditorChange}
											params={() => handleParamsChange()}
											onValidate={setJsonValidate}
										/>
									</Form.Item>
								</Col>
								<Col
									span={4}
									xl={4}
									md={24}
									sm={24}
								>
									<Row gutter={16}>
										<Col span={24}>
											<Form.Item
												label="Name function"
												name="label"
												rules={[
													{
														required: true,
													},
												]}
												{...validationErrorsBag.getInputErrors("label")}
											>
												<Input allowClear />
											</Form.Item>
										</Col>
										{!data && (
											<Col span={24}>
												<Form.Item
													label="ID function"
													name="id"
													rules={[
														{
															required: true,
														},
													]}
													{...validationErrorsBag.getInputErrors("id")}
												>
													<Input allowClear />
												</Form.Item>
											</Col>
										)}
									</Row>
									<Form.Item
										name="description"
										label="Notes"
										{...validationErrorsBag.getInputErrors("description")}
									>
										<TextArea
											rows="6"
											allowClear
										/>
									</Form.Item>
									<Form.Item
										label="Function category"
										name="custom_function_category_id"
										rules={[
											{
												required: true,
												message: "Category cannot be empty",
											},
										]}
										{...validationErrorsBag.getInputErrors(
											"custom_function_category_id"
										)}
									>
										<SelectFunction />
									</Form.Item>
									<Divider className="my-2">Arguments</Divider>

									<Form.List
										name="arguments"
										label=""
									>
										{(fields, { add, remove }) => (
											<>
												{fields.map(({ key, name, ...restField }) => (
													<Row
														gutter={16}
														key={key}
													>
														<Col span={22}>
															<Form.Item
																{...restField}
																name={[name, "name"]}
																rules={[
																	{
																		required: true,
																		message:
																			"Argument name is required",
																	},
																]}
															>
																<Input placeholder="name" />
															</Form.Item>
														</Col>
														<Col
															span={2}
															className="text-right"
														>
															<Button
																danger
																icon={<IconTrash />}
																onClick={() => remove(name)}
															/>
														</Col>
													</Row>
												))}
												<Form.Item>
													<Button
														type="dashed"
														onClick={() => add()}
														block
														icon={<IconPlus />}
													>
														Add argument
													</Button>
												</Form.Item>
											</>
										)}
									</Form.List>
								</Col>
							</Row>
						</Form>
					</Spin>
				</div>
			</Modal>
		</>
	);
};

export default ModalFunction;
