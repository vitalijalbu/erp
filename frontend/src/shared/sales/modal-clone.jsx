import React, { useState, useRef } from "react";
import { cloneSalePricelist } from "@/api/sales/pricelist";
import { clonePurchasePricelist } from "@/api/purchases/pricelist";
import { Modal, Space, Row, Col, Form, Input, Button, message, InputNumber, Typography, Flex } from "antd";
const { Title } = Typography;
import { IconPlus, IconTrash } from "@tabler/icons-react";
import _ from "lodash";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectItemGroup from "@/shared/form-fields/items/select-item-group";
import SelectItemSubGroup from "@/shared/form-fields/items/select-item-subgroup";
import PriceInput from "@/shared/form-fields/price-input";

const ModalClone = ({ opened, toggle, id, reload, isSale, data }) => {
    const [form] = Form.useForm();
    const formRef = useRef(null);
    const formRows = Form.useWatch('rows', form);  // check real time changing rows

    const [loading, setLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);
    const validationErrorsBag = useValidationErrors();

    // Action Issue Materials
    const handleSubmit = async (values) => {
        // format the date fields
        setLoading(true);
		//set default body object due to antd bug #47279
		const body = { ...values };
		if (values.rows !== undefined && values.rows.length > 0) {
			body.rows = values.rows;
		}
        const { status, error, errorMsg, validationErrors } = await (isSale ? cloneSalePricelist(data?.id, body) : clonePurchasePricelist(data?.id, body));

        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
                setLoading(false);
                console.log('validationErrorsBag', validationErrorsBag)
            }
            message.error(errorMsg);
            setLoading(false);
        } else {
            message.success("Pricelist cloned successfully.");
            setLoading(false);
            toggle();
            reload();
        }
    };

    return (
		<Modal
			open={opened}
			onCancel={toggle}
			width={"60%"}
			centered
			maskClosable={!isFormChanged}
			transitionName="ant-modal-slide-up"
			title={
				<>
					Duplicate pricelist - <mark>{data?.code}</mark>
				</>
			}
			footer={[
				<Button
					key={0}
					onClick={toggle}
				>
					Close
				</Button>,
				<Button
					key="submit"
					type="primary"
					htmlType="submit"
					form="form-clone"
					loading={loading}
					disabled={!isFormChanged}
				>
					Save
				</Button>,
			]}
		>
			<Form
				form={form}
				ref={formRef}
				name="form-clone"
				layout="vertical"
				onFinish={handleSubmit}
				onValuesChange={(changedValues, allValues) => {
					//handleFieldValueChange(changedValues);
					setIsFormChanged(true);
				}}
			>
				<Form.Item
					name="code"
					label="New code"
					{...validationErrorsBag.getInputErrors("code")}
				>
					<Input allowClear />
				</Form.Item>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							name="currency_id"
							label="Currency"
							initialValue={data?.currency_id}
							{...validationErrorsBag.getInputErrors("currency_id")}
						>
							<SelectCurrency />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="rate"
							label="Rate"
							{...validationErrorsBag.getInputErrors("rate")}
						>
							<InputNumber
								placeholder="0.00"
								min={0}
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Business Partner"
							name="bp_id"
							{...validationErrorsBag.getInputErrors("bp_id")}
						>
							<SelectBP onChange={(value) => form.setFieldValue("bp_id", value)} />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							name="price_change"
							label="Price change"
							{...validationErrorsBag.getInputErrors('price_change')}
						>
							<PriceInput
								currency={"%"}
								currencyOptions={[{ id: "%", symbol: "%" }]}
								noDefaultValue
								showSymbolSelection
							/>
						</Form.Item>
					</Col>
				</Row>
				<Title level={5}>Price variantions</Title>
				<Form.List name="rows">
					{(fields, { add, remove }) => (
						<>
							{fields.map(({ key, name, ...restField }) => (
								<Flex
									key={key}
									gap="middle"
									align="end"
									justify="space-between"
									style={{marginBottom: '15px'}}
								>
									<Form.Item
										{...restField}
										style={{ width: "100%", marginBottom: 0 }}
										label="Product type"
										name={[name, "item_group_id"]}
										{...validationErrorsBag.getInputErrors(`rows.${key}.item_group_id`)}
									>
										<SelectItemGroup
											disabled={
												formRows?.[key] &&
												formRows[key].item_subfamily_id !== undefined
											}
										/>
									</Form.Item>

									<Form.Item
										{...restField}
										style={{ width: "100%", marginBottom: 0 }}
										label="Item Group"
										name={[name, "item_subfamily_id"]}
										{...validationErrorsBag.getInputErrors(`rows.${key}.item_subfamily_id`)}
									>
										<SelectItemSubGroup
											disabled={
												formRows?.[key] &&
												formRows[key].item_group_id !== undefined
											}
										/>
									</Form.Item>

									<Form.Item
										{...restField}
										style={{ width: "100%", marginBottom: 0 }}
										name={[name, "price_change"]}
										label="Price change"
										{...validationErrorsBag.getInputErrors(`rows.${key}.price_change`)}
									>
										<PriceInput
											currency={"%"}
											currencyOptions={[{ id: "%", symbol: "%" }]}
											noDefaultValue
											showSymbolSelection
										/>
									</Form.Item>

									<div style={{ width: "10%", marginBottom: 0 }}>
										<Button
											danger
											icon={<IconTrash />}
											onClick={() => remove(name)}
										/>
									</div>
								</Flex>
							))}
							<Form.Item>
								<Button
									type="dashed"
									onClick={() => add()}
									icon={<IconPlus />}
								>
									Add price change
								</Button>
							</Form.Item>
						</>
					)}
				</Form.List>
			</Form>
		</Modal>
	);
};

export default ModalClone;
