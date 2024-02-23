import React, { useState, useEffect, useCallback } from "react";
import { createBPGroup, updateBPGroup } from "@/api/bp";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Button, Form, Modal, Input, message } from "antd";

const ModalGroup = ({ opened, toggle, data, reload, onModalSave }) => {
	const [form] = Form.useForm();
	const [loading, setLoading] = useState(false);
	const validationErrorsBag = useValidationErrors();

	// Form Submit
	const handleSubmit = useCallback(
		async (values) => {
			setLoading(true);
			try {
				// let status, error, validationErrors;
				let response;
				if (data) {
					// Update existing
					response = await updateBPGroup(data.id, values);
				} else {
					// Create new
					response = await createBPGroup(values);
				}

				if (response.error) {
					if (response.validationErrors) {
						validationErrorsBag.setValidationErrors(response.validationErrors);
					}
					message.error("Error during saving operation");
				} else {
					const successMessage = data
						? "BP group updated successfully"
						: "BP group created successfully";
					message.success(successMessage);
					if (onModalSave && _.isFunction(onModalSave) && !data) {
						onModalSave(response.data);
					}
					toggle();
					reload();
				}
			} catch (error) {
				message.error("Error during saving operation");
			} finally {
				setLoading(false);
			}
		},
		[data, toggle, validationErrorsBag, reload]
	);

	//Fill form
	useEffect(() => {
		if (data) {
			form.setFieldsValue({
				name: data.name,
			});
		} else {
			form.resetFields();
		}
	}, [data, form]);

	return (
		<Modal
			open={opened}
			onCancel={toggle}
			title={
				data ? (
					<>
						Update BP group - <mark>{data.name}</mark>
					</>
				) : (
					"Create new BP group"
				)
			}
			centered
			maskClosable={false}
			transitionName="ant-modal-slide-up"
			footer={[
				<Button
					key={0}
					onClick={toggle}
				>
					Close
				</Button>,
				<Button
					key={1}
					type="primary"
					htmlType="submit"
					form="BP group-form"
					loading={loading}
				>
					{data ? "Save" : "Create"}
				</Button>,
			]}
		>
				<Form
					layout="vertical"
					name="BP group-form"
					form={form}
					onFinish={handleSubmit}
					disabled={loading}
				>
					<Form.Item
						label="Name"
						name="name"
						rules={[{ required: true }]}
						{...validationErrorsBag.getInputErrors("name")}
					>
						<Input allowClear />
					</Form.Item>
				</Form>
		</Modal>
	);
};

export default ModalGroup;
