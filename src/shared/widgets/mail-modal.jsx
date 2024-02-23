import React, { useState, useEffect } from "react";
import { IconAlertCircle, IconSend } from "@tabler/icons-react";
import { Button, Form, Input, Modal, Select, message } from "antd";
import dynamic from "next/dynamic";
import _ from "lodash";
const { confirm } = Modal;

const MailModal = ({ open, id, from, to, cc, subject, body, submitFunction, onClose }) => {
	const Wysiwyg = dynamic(() => import("@/shared/form-fields/wysiwyg"), { ssr: false });
	const [form] = Form.useForm();
	const [ccOpts, setCcOpts] = useState([]);

	useEffect(() => {
		if (_.isArray(cc)) {
			setCcOpts(
				_.map(cc, (i) => {
					return { label: i, value: i };
				})
			);
		} else {
			setCcOpts(
				_.map([cc], (i) => {
					return { label: i, value: i };
				})
			);
		}

		form.setFieldsValue({ template: body, subject: subject, to: _.map(to, "value") });
	}, [open]);

	const handleSubmit = async () => {
		// Mail sale API
		confirm({
			title: <>Send email confirmation</>,
			icon: (
				<IconAlertCircle
					color={"#faad14"}
					size="22"
					className="anticon"
				/>
			),
			transitionName: "ant-modal-slide-up",
			content: `An email will be sent to ${form.getFieldValue("to").join(", ")}. Continue?`,
			okText: "Send",
			cancelText: "Cancel",
			async onOk() {
				const { error, data, errorMsg } = await submitFunction(id, form.getFieldsValue());
				if (!error) {
					message.success("Mail sent successfully");
					onClose();
				} else {
					message.error(errorMsg);
				}
			},
		});
	};
	return (
		<Modal
			open={open}
			width={"40%"}
			title="Compose Email"
			destroyOnClose
			onCancel={() => onClose()}
			maskClosable={false}
			transitionName="ant-modal-slide-up"
			footer={[
				<Button onClick={() => onClose()}>Close</Button>,
				<Button
					key={3}
					icon={<IconSend width={20} />}
					type="primary"
					htmlType="submit"
					form="mail-form"
					disabled={!from}
				>
					Send
				</Button>,
			]}
		>
			<Form
				labelCol={{ span: 3 }}
				colon={false}
				name="mail-form"
				form={form}
				onFinish={handleSubmit}
			>
				<Form.Item
					label="from"
					name="from"
					initialValue={from}
				>
					<Input disabled></Input>
				</Form.Item>
				<Form.Item
					label="cc"
					name="cc"
					initialValue={_.filter(cc, (o) => !_.isNil(o))}
				>
					<Select
						disabled
						mode="multiple"
						options={ccOpts}
					></Select>
				</Form.Item>
				<Form.Item
					label="to"
					name="to"
				>
					<Select
						mode="tags"
						options={to || []}
					></Select>
				</Form.Item>
				<Form.Item
					label="subject"
					name="subject"
					// initialValue={subject}
				>
					<Input></Input>
				</Form.Item>
				<Form.Item
					name={"template"}
					hidden
					initialValue={body}
				>
					<Input.TextArea />
				</Form.Item>

				{body && (
					<Wysiwyg
						data={body}
						onChange={(value) => {
							console.log(value);
							form.setFieldValue("template", value);
						}}
					/>
				)}
			</Form>
		</Modal>
	);
};
export default MailModal;
