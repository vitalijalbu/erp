import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	Row,
	Col,
	Card,
	Form,
	Input,
	InputNumber,
	Button,
	Switch,
	Divider,
	Modal,
	message,
	Alert,
} from "antd";
const { confirm } = Modal;
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";
import {
	createProcess,
	deleteProcess,
	getProcessById,
	updateProcess,
} from "@/api/processes/processes";
import SelectCostItem from "@/shared/form-fields/select-cost-item";
import RowsMachines from "./rows-machines";
import PageActions from "@/shared/components/page-actions";
import { IconTrash } from "@tabler/icons-react";
import { parseBool } from "@/hooks/formatter";

const FormProcess = ({ id, isModal, toggle, isSaving, setIsSaving, onModalSave }) => {
	const router = useRouter();
	const validationErrorsBag = useValidationErrors();

	const [form] = Form.useForm();
	const needMachines = Form.useWatch("need_machine", form);
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [reload, setReload] = useState(0);
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState({});
	const [machines, setMachines] = useState([]);
	const [machinesArray, setMachinesForm] = useState([]);

	useEffect(() => {
		if (router.isReady && id) {
			(async () => {
				const { data, error } = await getProcessById(id);
				if (!error) {
					setLoading(true);

					if (!error) {
						loadData(data);
					} else {
						router.push("/processes");
						message.error("404 - Record Not Found");
					}
				} else {
					router.push("/processes");
				}
				setLoading(false); // Move setLoading inside the if-else block
			})();
		}
	}, [router.isReady, id]);

	const loadData = (data) => {
		setData(data);
		setMachines(data?.machines || []);
		form.setFieldsValue({
			name: data?.name,
			code: data?.code,
			price_item_id: data?.price_item_id,
			setup_price_item_id: data?.setup_price_item_id,
			operator_cost_item_id: data?.operator_cost_item_id,
			execution_time: data?.execution_time,
			setup_time: data?.setup_time,
			men_occupation: data?.men_occupation,
			need_machine: parseBool(data?.need_machine),
		});
	};

	// Submit form
	const handleSubmit = async (values) => {
		validationErrorsBag.clear();
		if (id) {
			var { data, status, error, errorMsg, validationErrors } = await updateProcess(id, {
				...values,
				machines: machinesArray,
			});
		} else {
			var { data, status, error, errorMsg, validationErrors } = await createProcess({
				...values,
				machines: machinesArray,
			});
		}
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			if (typeof setIsSaving === "function") setIsSaving(false);
			message.error(errorMsg);
		} else {
			if (typeof toggle === "function") toggle();
			//setData(data)
			message.success("Process saved succesfully");
			//setReload(reload + 1);
			if (isModal) {
				onModalSave(data);
			} else if (!id) {
				router.push("/processes");
			} else {
				setReload(reload + 1);
				setIsFormChanged(false);
			}
		}
		if (typeof setIsSaving === "function") setIsSaving(false);
		setLoading(false);
	};

	useEffect(() => {
		if (isSaving) {
			form.submit();
		}
	}, [isSaving]);

	// Function to update the state in the parent component
	const updatePivotsMachines = (rows, quite) => {
		setMachinesForm(rows);
		if (!quite) {
			setIsFormChanged(true);
		}
	};

	// Delete button
	const handleDelete = async () => {
		confirm({
			title: "Confirm Deletion",
			transitionName: "ant-modal-slide-up",
			content: "Are you sure you want to delete this process?",
			okText: "Delete",
			okType: "danger",
			cancelText: "Cancel",
			async onOk() {
				try {
					const { data, error } = await deleteProcess(id);
					if (error) {
						message.error("Error deleting the Process");
					} else {
						message.success("Process deleted successfully");
						router.push("/processes");
					}
				} catch (error) {
					message.error("An error occurred while deleting the Process");
				}
			},
		});
	};

	return (
		<div className="page">
			{!isModal && (
				<PageActions
					backUrl="/processes"
					loading={loading}
					title={
						id ? (
							<>
								Update Process - <mark> {data?.code}</mark>
							</>
						) : (
							"Create new Process"
						)
					}
					extra={[
						<Button
							key="submit"
							htmlType="submit"
							type="primary"
							form="process-form"
							loading={loading}
						>
							Save
						</Button>,
						id && (
							<Button
								danger
								icon={<IconTrash />}
								onClick={handleDelete}
								key={"delete"}
							>
								Delete
							</Button>
						),
					]}
				>
					{isFormChanged && (
						<Alert
							message="The form has changes. please save before moving away."
							type="warning"
							showIcon
						/>
					)}
				</PageActions>
			)}
			{isFormChanged && isModal && (
				<Alert
					message="The form has changes. please save before moving away."
					type="warning"
					showIcon
				/>
			)}
			<div className="page-content">
				<Card
					title="Process details"
					className="mb-3"
					loading={loading}
				>
					<Row gutter={16}>
						<Col span={24}>
							<Form
								layout="vertical"
								form={form}
								name="process-form"
								onFinish={(values) => handleSubmit(values)}
								onValuesChange={() => setIsFormChanged(true)}
							>
								<Row gutter={16}>
									{!id && (
										<Col span={12}>
											<Form.Item
												label="Code"
												name="code"
												{...validationErrorsBag.getInputErrors("code")}
											>
												<Input allowClear />
											</Form.Item>
										</Col>
									)}
									<Col span={12}>
										<Form.Item
											label="Name"
											name="name"
											{...validationErrorsBag.getInputErrors("name")}
										>
											<Input allowClear />
										</Form.Item>
									</Col>

									<Col span={12}>
										<Form.Item
											label="Price Item"
											name="price_item_id"
											{...validationErrorsBag.getInputErrors("price_item_id")}
										>
											<SelectCostItem type="service" />
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label="Setup Price Item"
											name="setup_price_item_id"
											{...validationErrorsBag.getInputErrors(
												"setup_price_item_id"
											)}
										>
											<SelectCostItem type="service" />
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label="Operator Cost Item"
											name="operator_cost_item_id"
											{...validationErrorsBag.getInputErrors(
												"operator_cost_item_id"
											)}
										>
											<SelectCostItem type="cost" />
										</Form.Item>
									</Col>
								</Row>
								<Divider orientation="left">Other info</Divider>
								<Row gutter={16}>
									<Col span={12}>
										<Form.Item
											label="Execution Time"
											name="execution_time"
											initialValue={0}
											{...validationErrorsBag.getInputErrors(
												"execution_time"
											)}
										>
											<InputNumber
												addonAfter="minutes"
												min={0}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label="Setup Time"
											name="setup_time"
											initialValue={0}
											{...validationErrorsBag.getInputErrors("setup_time")}
										>
											<InputNumber
												addonAfter="minutes"
												min={0}
											/>
										</Form.Item>
									</Col>
								</Row>
								<Row gutter={16}>
									<Col span={12}>
										<Form.Item
											label="Men occupation"
											name="men_occupation"
											initialValue={1}
											{...validationErrorsBag.getInputErrors(
												"men_occupation"
											)}
										>
											<InputNumber
												addonAfter="men"
												min={1}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label="Need Machine"
											name="need_machine"
											valuePropName="checked"
											initialValue={0}
											{...validationErrorsBag.getInputErrors("setup_time")}
										>
											<Switch
												checkedChildren="Yes"
												unCheckedChildren="No"
											/>
										</Form.Item>
									</Col>
								</Row>
							</Form>
						</Col>
					</Row>
				</Card>

				{needMachines == true && (
					<RowsMachines
						data={data.machines || []}
						errors={validationErrorsBag?.errors}
						loading={loading}
						onChange={(rows, quite) => updatePivotsMachines(rows, quite)}
					/>
				)}
			</div>
		</div>
	);
};

export default FormProcess;
