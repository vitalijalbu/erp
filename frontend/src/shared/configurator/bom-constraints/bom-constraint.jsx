import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import {
	getConstraintById,
	createConstraint,
	updateConstraint,
	deleteConstraint,
	getConstraintTypeById,
} from "@/api/configurator/constraints";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Row, Col, Form, message, Card, Input, Modal } from "antd";
const { TextArea } = Input;
const { confirm } = Modal;
import Editor from "@/shared/blockly/editor";
import { useRouter } from "next/router";
import { destroyBlocklyOrphans } from "@/hooks/helper-functions";
import SelectCompany from "@/shared/form-fields/select-company";
import { parseBool } from "@/hooks/formatter";

const BomConstraint = (props) => {
	const {
		id,
		title,
		saveEnabled,
		deleteEnabled,
		onSave,
		onUpdate,
		onDelete,
		setIsDraft,
		isDraft = false,
		loading = false,
		setLoading,
		formChanged,
		setFormChanged,
	} = props;

	// Set page permissions
	if (!UserPermissions.authorizePage("configurator.manage")) {
		return false;
	}

	const createMessages = {
		success: "Constraint created successfully",
		error: "Error during creating operation",
	};

	const updateMessages = {
		success: "Constraint updated successfully",
		error: "Error during upodating operation",
	};

	const deleteMessages = {
		success: "Constraint deleted successfully",
		error: "An error occurred while deleting the BOM constraint",
	};

	const router = useRouter();

	const [form] = Form.useForm();
	const validationErrorsBag = useValidationErrors();
	const [jsonValidate, setJsonValidate] = useState(true);
	const [blocklyJson, setBlocklyJson] = useState({});
	const [constraintType, setConstraintType] = useState({});

	// Fill form here based on ID page
	useEffect(() => {
		if (id && router.isReady) {
			setLoading(true);
			getConstraintById(id)
				.then(({ data }) => {
					// Fill form here
					form.setFieldsValue({
						label: data.label,
						description: data.description,
						company_id: data.company_id,
						// body: JSON.stringify(data.body, null, 2),
					});
					// set blockly state
					setBlocklyJson(data.body);
					setIsDraft(data.is_draft);
					setFormChanged(false);
				})
				.finally(() => {
					setLoading(false);
				});
		} else {
			form.resetFields();
		}
	}, [id, router.isReady, form]);

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
		const { status, data, error, validationErrors, errorMsg } = await createConstraint(body);
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			message.error(errorMsg);
			setLoading(false);
		} else {
			message.success(createMessages.success);
			onSave(data);
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
			message.error(
				"Some of the inserted Blocks have empty value!  Please check that all inputs are filled and retry."
			);
			return;
		}

		const body = { ...values, body: blocklyJson };
		validationErrorsBag.setValidationErrors([]);

		const response = await updateConstraint(id, body);

		if (response.error) {
			if (response.validationErrors) {
				validationErrorsBag.setValidationErrors(response.validationErrors);
			}
			message.error(response.errorMsg);
			setLoading(false);
		} else {
			message.success(updateMessages.success);
			setLoading(false);
			onUpdate();
		}
	};

	const handleEditorChange = useCallback((updatedState) => {
		setBlocklyJson(updatedState);
		setFormChanged(true);
		form.setFieldsValue({ body: updatedState });
	}, []);

	useEffect(() => {
		(async () => {
			const { data, error } = await getConstraintTypeById("bom");
			if (error) {
				message.error(error.response.data.message);
			} else {
				setConstraintType(data);
				form.setFieldValue("constraint_type_id", data.id);
			}
		})();
		return () => {
			destroyBlocklyOrphans();
		};
	}, []);

	return (
		<>
			<div className="page">
				<div className="page-content">
					<Row gutter={16}>
						<Col span={24}>
							<Card
								className="mb-3"
								loading={loading}
							>
								<Form
									layout="vertical"
									form={form}
									name="form-constraint"
									disabled={loading}
									onFinish={
										deleteEnabled ? handleSubmitUpdate : handleSubmitCreate
									}
								>
									<Row gutter={16}>
										<Col
											span={20}
											xl={20}
											md={24}
											sm={24}
										>
											<Form.Item
												label="Body"
												name="body"
											>
												<Editor
													state={blocklyJson}
													onSave={handleEditorChange}
													onValidate={(value) => setJsonValidate(value)}
													toolboxType="bom"
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
														label="Label"
														name="label"
														rules={[{ required: true }]}
														{...validationErrorsBag.getInputErrors(
															"label"
														)}
													>
														<Input allowClear />
													</Form.Item>
												</Col>
												{!id ? (
													<Col span={24}>
														<Form.Item
															label="ID"
															name="id"
															rules={[{ required: true }]}
															{...validationErrorsBag.getInputErrors(
																"id"
															)}
														>
															<Input allowClear />
														</Form.Item>
													</Col>
												) : (
													<></>
												)}
												{parseBool(constraintType.require_company) && (
													<Col span={24}>
														<Form.Item
															label="Company"
															name="company_id"
															{...validationErrorsBag.getInputErrors(
																"company_id"
															)}
														>
															<SelectCompany />
														</Form.Item>
													</Col>
												)}
												{/* Il constraint type deve essere nascosto */}
												<Col span={24}>
													<Form.Item
														label="Description"
														name="description"
														{...validationErrorsBag.getInputErrors(
															"description"
														)}
													>
														<TextArea
															rows="6"
															allowClear
														/>
													</Form.Item>
												</Col>
												<Col span={12}>
													<Form.Item
														name="constraint_type_id"
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

export default BomConstraint;
