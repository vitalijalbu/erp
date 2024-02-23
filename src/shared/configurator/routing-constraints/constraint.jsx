import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import {
	getConstraintById,
	createConstraint,
	updateConstraint,
	deleteConstraint,
} from "@/api/configurator/constraints";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Row,
	Col,
	Button,
	Form,
	message,
	Card,
	Input,
	Modal,
	Select,
} from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import Editor from "@/shared/blockly/editor";
import { useRouter } from "next/router";
import { destroyBlocklyOrphans } from "@/hooks/helper-functions";
import { SaveOutlined } from "@ant-design/icons";
import { IconTrash } from "@tabler/icons-react";
import SelectCompany from "@/shared/form-fields/select-company";
import { parseBool } from "@/hooks/formatter";

const FormBody = (props) => {
	const router = useRouter();
	console.log(props);
	const [form] = Form.useForm();
	const validationErrorsBag = useValidationErrors();
	const [jsonValidate, setJsonValidate] = useState(true);
	const [blocklyJson, setBlocklyJson] = useState({});

	const [data, setData] = useState(false); // state for data OBJ
	const [isDraft, setIsDraft] = useState(false);
	const [loading, setLoading] = useState(false);
	const [formChanged, setFormChanged] = useState(false);

	const createMessages = {
		success: "Constraint created successfully",
		error: "Error during creating operation",
	};

	const updateMessages = {
		success: "Constraint updated successfully",
		error: "Error during upodating operation",
	};
	const id = props.id;

	const deleteMessages = {
		success: "Constraint deleted successfully",
		error: "An error occurred while deleting the Routing constraint",
	};

	// Delete action
	const handleSubmitDelete = async () => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this Routing constraint?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteConstraint(id);
					if (error) {
						message.error(deleteMessages.error);
					} else {
						message.success(deleteMessages.success);
					}
				} catch (error) {
					message.error(deleteMessages.error);
				}
			},
		});
	};

	// Fill form here based on ID page
	useEffect(() => {
		if (id && router.isReady) {
			console.log(data);
			setLoading(true);
			getConstraintById(id)
				.then(({ data }) => {
					// Fill form here
					form.setFieldsValue({
						label: data.label,
						description: data.description,
						subtype: "routing_activation",
						// body: JSON.stringify(data.body, null, 2),
					});
					// set blockly state
					setBlocklyJson(data.body);
					setIsDraft(data.is_draft);
					setFormChanged(false);
					setData(data);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			form.resetFields();
		}
	}, [router.isReady, form]);

	// Create action
	const handleSubmitCreate = async (values) => {
		setLoading(true);

		if (isDraft) {
			values.is_draft = true;
		}

		if (!jsonValidate) {
			setLoading(false);
			message.error(
				"Some of the Blocks insert has empty value! Please check that all inputs are filled and retry."
			);
			return;
		}

		const body = { ...values, body: blocklyJson };
		const { status, data, error, validationErrors } = await createConstraint(
			body
		);
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			message.error(createMessages.error);
			setLoading(false);
		} else {
			message.success(createMessages.success);
			props.onSave();
		}
	};

	// Update action
	const handleSubmitUpdate = async (values) => {
		setLoading(true);

		if (isDraft) {
			values.is_draft = true;
		}

		if (!jsonValidate) {
			setLoading(false);
			message.open({
				type: "error",
				content:
					"Some of the inserted Blocks have empty value!  Please check that all inputs are filled and retry.",
			});
			return;
		}

		const body = { ...values, body: blocklyJson };
		validationErrorsBag.setValidationErrors([]);

		const response = await updateConstraint(id, body);

		if (response.error) {
			if (response.validationErrors) {
				validationErrorsBag.setValidationErrors(response.validationErrors);
			}
			message.open({ type: "error", content: updateMessages.error });
			setLoading(false);
		} else {
			message.open({ type: "success", content: updateMessages.success });
			setLoading(false);
		}
	};

	const handleEditorChange = useCallback((updatedState) => {
		setBlocklyJson(updatedState);
		setFormChanged(true);
		form.setFieldsValue({ body: updatedState });
	}, []);

	useEffect(() => {
		return () => {
			destroyBlocklyOrphans();
		};
	}, []);

	return (
		<>
			<div className='page'>
				<div className='page-content'>
					<Row gutter={16}>
						<Col span={24}>
							<Card loading={loading}>
								<Form
									layout='vertical'
									form={form}
									name='form-constraint'
									disabled={loading}
									onFinish={data ? handleSubmitUpdate : handleSubmitCreate}
									initialValues={{
										constraint_type_id: "routing",
									}}
								>
									<Row gutter={16}>
										<Col
											span={20}
											xl={20}
											md={24}
											sm={24}
										>
											<Form.Item
												label='Body'
												name='body'
											>
												<Editor
													state={blocklyJson}
													onSave={handleEditorChange}
													onValidate={(value) => setJsonValidate(value)}
													toolboxType='routing'
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
														label='Label'
														name='label'
														rules={[{ required: true }]}
														{...validationErrorsBag.getInputErrors("label")}
													>
														<Input allowClear />
													</Form.Item>
												</Col>
												{!id && (
													<Col span={24}>
														<Form.Item
															label='ID'
															name='id'
															rules={[{ required: true }]}
															{...validationErrorsBag.getInputErrors("id")}
														>
															<Input allowClear />
														</Form.Item>
													</Col>
												)}
												{/* Il constraint type deve essere nascosto */}
												<Col span={24}>
													<Form.Item
														label='Subtype'
														name='subtype'
														initialValue='routing_activation'
														rules={[{ required: true }]}
														{...validationErrorsBag.getInputErrors("subtype")}
													>
														<Select
															name='subtype'
															options={[
																{
																	value: "routing_activation",
																	label: "Activation",
																},
																// {value: 'routing_workload', label: 'Workload'}
															]}
															placeholder='Select subtype'
															allowClear
														/>
													</Form.Item>
												</Col>
												<Col span={24}>
													<Form.Item
														label='Description'
														name='description'
														{...validationErrorsBag.getInputErrors(
															"description"
														)}
													>
														<TextArea
															rows='6'
															allowClear
														/>
													</Form.Item>
												</Col>
												<Col span={12}>
													<Form.Item
														name='constraint_type_id'
														hidden
													>
														<Input allowClear />
													</Form.Item>
												</Col>
											</Row>
										</Col>
									</Row>
								</Form>
							</Card>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default FormBody;
