import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Form, Input, message, InputNumber } from "antd";
const { TextArea } = Input;
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";
import { createMachine, getMachineById, updateMachine } from "@/api/machines/machines";
import SelectWorkcenter from "../form-fields/select-workcenter";
import SelectCostItem from "../form-fields/select-cost-item";


const MachinesForm = ({ machine, isModal, toggle, reload, onLoading }) => {
	const router = useRouter();
	const { id } = router.query;
	const validationErrorsBag = useValidationErrors();

	const [form] = Form.useForm();
	const [localData, setLocalData] = useState({});

	useEffect(() => {
		if (id) {
				getMachineById(id)
					.then(({ data }) => {
						form.setFieldsValue(data);
						setLocalData(data)
					})
					.catch((error) => message.error(error));

			} else if(machine !== undefined) {
				form.setFieldsValue(machine);
			}
	}, [id]);

	const handleSubmit = async (values) => {
		if (machine) {
			var { status, error, errorMsg, validationErrors } = await updateMachine(id, values);
		} else {
			var { status, error, errorMsg, validationErrors } = await createMachine(values);
		}
		if (error) {
			if (validationErrors) {
				validationErrorsBag.setValidationErrors(validationErrors);
			}
			message.error(errorMsg);
			console.log('validationErrors', validationErrors);
			console.log('validationErrorsBag', validationErrorsBag.getInputErrors('workcenter_id'));
		} else {
			message.success("Machine saved succesfully");
			if (!isModal) {
				router.push("/machines");
			} else {
				reload();
				toggle();
			}
		}
	};

	return (
		<>
			<div className="page-content">
				<Row gutter={16}>
					<Col span={24}>
						<Form
							layout="vertical"
							form={form}
							name="machine-form"
							onFinish={handleSubmit}
						>
							<Row gutter={16}>
									<Col span={12}>
										<Form.Item
											label="Code"
											name="code"
											{...validationErrorsBag.getInputErrors("code")}
										>
											<Input allowClear />
										</Form.Item>
									</Col>
								<Col span={12}>
									<Form.Item
										label="Workcenter"
										name="workcenter_id"
										{...validationErrorsBag.getInputErrors("workcenter_id")}
									>
										<SelectWorkcenter />
									</Form.Item>
								</Col>

								<Col span={12}>
									<Form.Item
										label="Cost Item"
										name="cost_item_id"
										{...validationErrorsBag.getInputErrors("cost_item_id")}
									>
										<SelectCostItem type="cost" />
									</Form.Item>
								</Col>

								<Col span={12}>
									<Form.Item
										label="Men Occupation"
										name="men_occupation"
										{...validationErrorsBag.getInputErrors("men_occupation")}
									>
										<InputNumber
											min={0}
											max={9999999}
											type="number"
										/>
									</Form.Item>
								</Col>
							</Row>
							<Form.Item
										label="Description"
										name="description"
										{...validationErrorsBag.getInputErrors("Description")}
									>
										<TextArea rows={3}/>
									</Form.Item>
						</Form>
					</Col>
				</Row>
			</div>
		</>
	);
};

export default MachinesForm;
