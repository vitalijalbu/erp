import React, { useEffect, useState } from "react";
import { useValidationErrors } from "@/hooks/validation-errors";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import SelectBPAddress from "@/shared/form-fields/bp/select-bp-address";
import SelectDeliveryTerm from "@/shared/form-fields/bp/select-delivery-term";
import ItemAutocomplete from "@/shared/form-fields/items/item-autocomplete";
import PriceInput from "@/shared/form-fields/price-input";
import SelectDateCheck from "@/shared/form-fields/select-date-check";
import SelectOrderType from "@/shared/form-fields/select-order-type";
import SelectWorkcenter from "@/shared/form-fields/select-workcenter";
//import SelectLot from "@/shared/stocks/select-lot";
import { IconTrash } from "@tabler/icons-react";
import {
	Button,
	Col,
	DatePicker,
	Divider,
	Drawer,
	Form,
	Input,
	InputNumber,
	Row,
	Space,
	Spin,
} from "antd";
import dayjs from "dayjs";
//import PriceDisplay from "@/shared/components/price-display";

const PRICE_CALCULATION_KEYS = [
	"item_id",
	"configuration",
	"quantity",
	"workcenter_id",
	"force_price_processing",
	"override_total_discount",
];

const DrawerItem = ({
	selected,
	nextIndex,
	opened,
	toggle,
	parentData,
	currencies,
	onSubmit,
	onDelete,
	priceFunction,
	loadingAction,
	formErrors
}) => {
	/* 
    data, parentData = formBody object from form-body.jsx
    */

	const [form] = Form.useForm();
	const formBody = Form.useWatch([], { form, preserve: true });
	const [loading, setLoading] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [isFormChanged, setIsFormChanged] = useState(false);
	const [isItemSelected, setIsItemSelected] = useState(false);

	//Calculate pricing function
	const handlePriceCalculation = async () => {
		validationErrorsBag.clear();

		// disabilitato loading sul calculation in quanto perde il focus se troviamo una soluzione possiamo riabilitarlo
		// setLoading(true);
		const calculatedRow = await priceFunction(form.getFieldsValue());

		if (_.has(calculatedRow, "errors")) {
			validationErrorsBag.setValidationErrors(calculatedRow.errors);
		}
		form.setFieldsValue({
			total_cost: calculatedRow.total_cost,
			total_discount: calculatedRow.total_discount,
			total_final_price: calculatedRow.total_final_price,
			total_profit: calculatedRow.total_profit,
			total_price: calculatedRow.total_price,
		});
		// setLoading(false);
	};

	const getItemError = () => {
		//console.log(form.getFieldValue("item_id"));
		let err = form.getFieldValue("item_id") ? "item_id" : "standard_product_id";

		return validationErrorsBag.getInputErrors(err);
	};
	// useEffect(() => {
	// 	if (!loading) {
	// 		handlePriceCalculation();
	// 	}
	// }, [
	// 	formBody?.quantity,
	// 	formBody?.item_id,
	// 	formBody?.configuration,
	// 	formBody?.workcenter_id,
	// 	formBody?.override_total_discount,
	// ]);

	useEffect(() => {
		setLoading(true);
		if (selected) {
			form.setFieldsValue({
				id: selected?.id,
				position: selected?.position,
				um: selected?.um,
				created_at: dayjs(selected?.created_at, "YYYY-MM-DD"),
				item_id: selected?.item_id,
				standard_product_id: selected?.standard_product_id,
				configuration: selected?.configuration,
				item_type: selected?.item_type,
				// lot_id: selected?.lot_id,
				quantity: selected?.quantity,
				delivery_date: selected?.delivery_date || null,
				order_type_id: selected?.order_type_id,
				state: selected?.state,
				customer_order_ref: selected?.customer_order_ref,
				order_ref_a: selected?.order_ref_a,
				order_ref_b: selected?.order_ref_b,
				order_ref_c: selected?.order_ref_c,
				total_profit: selected?.total_profit,
				total_price: selected?.total_price,
				total_discount: selected?.discount,
				total_cost: selected?.total_cost,
				total_final_price: selected?.total_final_price,
				destination_address_id: selected?.destination_address_id,
				delivery_term_id: selected?.delivery_term_id,
				company_id: selected?.company_id,
				carrier_id: selected?.carrier_id,
				workcenter_id: selected?.workcenter_id,
				tax_code: selected?.tax_code,
				sale_id: selected?.sale_id,
				sale_note: selected?.sale_note,
				billing_note: selected?.billing_note,
				production_note: selected?.production_note,
				shipping_note: selected?.shipping_note,
				packaging_note: selected?.packaging_note,
				override_total_discount: selected?.override_total_discount,
				override_total_discount_note: selected?.override_total_discount_note,
			});
		} else {
			form.setFieldsValue({
				created_at: dayjs(parentData?.created_at, "YYYY-MM-DD"),
				delivery_date: parentData?.delivery_date || null,
				order_type_id: parentData?.order_type_id,
				customer_order_ref: parentData?.customer_order_ref,
				order_ref_a: parentData?.order_ref_a,
				order_ref_b: parentData?.order_ref_b,
				order_ref_c: parentData?.order_ref_c,
				destination_address_id: parentData?.destination_address_id,
				delivery_term_id: parentData?.delivery_term_id,
				carrier_id: parentData?.carrier_id,
			});
		}
		setLoading(false);
		//setTimeout(() => handlePriceCalculation(), 1000);
	}, []);

	useEffect(() => {
		const resetNotServiceFields = () => {
			form.resetFields([
				"delivery_date",
				"carrier_id",
				"delivery_term_id",
				"destination_address_id",
			]);
		};
		if (formBody?.item_type === "service") {
			resetNotServiceFields();
		}
	}, [formBody?.item_type]);

	//console.log("RECEIVED_NUMBER:", form.getFieldValue("override_total_discount"));

	return (
		<Drawer
			open={opened}
			maskClosable={false}
			destroyOnClose={false}
			width={"40%"}
			onClose={toggle}
			title={
				selected ? (
					<>
						Update row <mark>#{selected?.index + 1}</mark>
					</>
				) : (
					"Add new row"
				)
			}
			extra={[
				<Space>
					{selected && (
						<Button
							key="calculate-price"
							type="primary"
							disabled={
								!form.getFieldValue("item_id") &&
								!form.getFieldValue("standard_product_id") &&
								!form.getFieldValue("configuration")
							}
							onClick={() => handlePriceCalculation()}
						>
							Prices Calculation
						</Button>
					)}
					{selected && (
						<Button
							key={0}
							icon={<IconTrash color="#e24004" />}
							onClick={() => onDelete(selected?.index)}
						>
							Delete row
						</Button>
					)}
					<Button
						key="submit"
						type="primary"
						htmlType="submit"
						loading={loadingAction}
						form="form-rows"
						disabled={selected ? !isFormChanged : !isItemSelected}
					>
						{selected ? "Update" : "Create"}
					</Button>
				</Space>,
			]}
		>
			<Form
				onFinish={onSubmit}
				disabled={loadingAction}
				onValuesChange={() => {
					setIsFormChanged(true);
				}}
				onFieldsChange={(changedFields, allFields) => {
					//console.log(changedFields[0].name[0]);
					if (PRICE_CALCULATION_KEYS.includes(changedFields[0].name[0])) {
						handlePriceCalculation();
						if (changedFields[0].name[0] === "override_total_discount") {
							setIsFormChanged(true);
						}
					}
				}}
				form={form}
				name="form-rows"
				layout="vertical"
			>
				<Row gutter={16}>
					<Form.Item
						hidden
						name="id"
					>
						<Input />
					</Form.Item>
					<Form.Item
						hidden
						label="N° row"
						name="position"
						initialValue={parseInt(nextIndex) + 10}
					>
						<InputNumber />
					</Form.Item>
					<Form.Item
						hidden
						name="um"
					>
						<Input />
					</Form.Item>
					<Col span={12}>
						<Form.Item
							label="Date order"
							tooltip="Default date is today"
							name="created_at"
							initialValue={dayjs(parentData.created_at, "YYYY-MM-DD")}
						>
							<DatePicker disabled />
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Item"
							name="item_id"
							{...getItemError()}
							{...formErrors.getInputErrors("item_id")}
						>
							<ItemAutocomplete
								itemValue={form.getFieldValue("item_id")}
								stdValue={form.getFieldValue("standard_product_id")}
								configuration={form.getFieldValue("configuration")}
								bp={parentData?.bp_id}
								onItemChange={(value, type, um) => {
									form.setFieldValue("item_id", value);
									form.setFieldValue("item_type", type);
									form.setFieldValue("um", um);
									form.resetFields(["standard_product_id"]);
									setIsFormChanged(true);
									setIsItemSelected(!!value);
									handlePriceCalculation();
								}}
								onStdChange={(value, type, um) => {
									form.setFieldValue("standard_product_id", value);
									form.setFieldValue("item_type", type);
									form.setFieldValue("um", um);
									form.resetFields(["item_id"]);
									setIsFormChanged(true);
									setIsItemSelected(!!value);
								}}
								onConfigurationSaved={(value) => {
									form.setFieldValue("configuration", value);
									setIsFormChanged(true);
									handlePriceCalculation();
								}}
								resetData={() => {
									form.resetFields([
										"item_id",
										"item_type",
										"um",
										"standard_product_id",
										"configuration",
									]);
									setIsFormChanged(false);
								}}
							/>
						</Form.Item>
						{/* hidden item type to render conditionally form fields */}
						<Form.Item
							hidden
							name="item_type"
						>
							<InputNumber />
						</Form.Item>
						<Form.Item
							hidden
							name="standard_product_id"
						>
							<Input />
						</Form.Item>
					</Col>
					<Form.Item
						label="Configuration"
						name="configuration"
						hidden
					>
						<Input disabled />
					</Form.Item>
					{/*hasLot() && (
						<Col span={12}>
							<Form.Item
								label="Lot"
								name="lot_id"
							>
								<SelectLot
									onChange={(value) => {
										form.setFieldValue("lot_id", value);
									}}
									filter={{
										columns: {
											id_item: { search: { value: formBody?.item_id } },
										},
									}}
								/>
							</Form.Item>
						</Col>
					)*/}
					<Col span={12}>
						<Form.Item
							label="Quantity"
							name="quantity"
							initialValue={1}
							{...validationErrorsBag.getInputErrors("quantity")}
							{...formErrors.getInputErrors("quantity")}
						>
							<InputNumber
								type="number"
								min={1}
								addonAfter={form.getFieldValue("um")}
							/>
						</Form.Item>
					</Col>
					{formBody?.item_type !== "service" && (
						<Col span={12}>
							<Form.Item
								label="Delivery Date"
								name="delivery_date"
								initialValue={parentData?.delivery_date ? dayjs(parentData?.delivery_date, "YYYY-MM-DD"): null}								
								{...formErrors.getInputErrors("delivery_date")}
							>
								<SelectDateCheck />
							</Form.Item>
						</Col>)}
					<Col span={12}>
						<Form.Item
							label="Order Type"
							name="order_type_id"
							initialValue={parentData?.order_type_id}
							{...validationErrorsBag.getInputErrors("order_type_id")}
							{...formErrors.getInputErrors("order_type_id")}
						>
							<SelectOrderType />
						</Form.Item>
					</Col>
					{/* <Col span={12}> */}
					<Form.Item
						label="Status"
						name="state"
						hidden
						initialValue={"inserted"}
					>
						<Input disabled />
					</Form.Item>
					{/* </Col> */}
				</Row>
				<Divider orientation="left">Other references</Divider>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Ref. order customer"
							name="customer_order_ref"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Ref. A"
							name="order_ref_a"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Ref. B"
							name="order_ref_b"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Ref. C"
							name="order_ref_c"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
				</Row>
				<Divider orientation="left">Delivery</Divider>
				<Row gutter={16}>
					{formBody?.item_type !== "service" && (
						<>
						<Col span={12}>
							<Form.Item
								label="Destination address"
								name="destination_address_id"
								initialValue={parentData?.destination_address_id}
								{...formErrors.getInputErrors("destination_address_id")}
							>
								<SelectBPAddress
									key={"bp-" + 1}
									idBP={parentData?.bp_id || null}
									type="shipping"
									onChange={(value) =>
										form.setFieldValue("destination_address_id", value)
									}
								/>
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Terms of Delivery"
								name="delivery_term_id"
								initialValue={parentData?.delivery_term_id}
								{...formErrors.getInputErrors("delivery_term_id")}
							>
								<SelectDeliveryTerm />
							</Form.Item>
						</Col>
						<Col span={12}>
							<Form.Item
								label="Carrier"
								name="carrier_id"
								initialValue={parentData?.carrier_id}
								{...formErrors.getInputErrors("carrier_id")}
							>
								<SelectBP
									key={1}
									onChange={(value) => form.setFieldValue("carrier_id", value)}
									filter={{ columns: { is_carrier: { search: { value: 1 } } } }}
								/>
							</Form.Item>
						</Col>
						</>
					)}
					<Col span={12}>
						<Form.Item
							label="Tax code"
							name="tax_code"
						>
							<Input allowClear />
						</Form.Item>
					</Col>
				</Row>
				<Divider orientation="left">Other</Divider>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Sale note"
							name="sale_note"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Billing note"
							name="billing_note"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item
							label="Production note"
							name="production_note"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Shipping note"
							name="shipping_note"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>

					<Col span={12}>
						<Form.Item
							label="Packaging note"
							name="packaging_note"
						>
							<Input
								placeholder="Free text"
								allowClear
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Workcenter"
							name="workcenter_id"
							initialValue={parentData?.workcenter_id}
							{...validationErrorsBag.getInputErrors("workcenter_id")}
						>
							<SelectWorkcenter
								key={1}
								onChange={(value) => form.setFieldValue("workcenter_id", value)}
								setDefault={(value) => form.setFieldValue("workcenter_id", value)}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Divider orientation="left">Prices</Divider>
				<Row gutter={16}>
					<Col span={12}>
						<Form.Item
							label="Discount Override"
							name="override_total_discount"
							{...validationErrorsBag.getInputErrors("override_total_discount")}
						>
							<PriceInput
								currency={"%"}
								onChange={(value) =>
									form.setFieldValue("override_total_discount", value)
								}
								emitValueOnChange={false}
								currencyOptions={[{ id: "%", symbol: "%" }]}
								noDefaultValue
								showSymbolSelection
							/>
						</Form.Item>
					</Col>
					<Col span={12}>
						<Form.Item
							label="Discount Override notes"
							name="override_total_discount_note"
						>
							<Input.TextArea
								autoSize
								disabled={!form.getFieldValue("override_total_discount")}
							/>
						</Form.Item>
					</Col>
				</Row>
				<Spin
					spinning={loading}
					tip="Calculating prices"
				>
					<Row gutter={16}>
						<Col span={8}>
							<Form.Item
								label="Total profit"
								name="total_profit"
								// initialValue={"1.00"}
							>
								<PriceInput
									disabled
									currency={
										parentData.company_currency_id || parentData.currency_id
									}
									currencyOptions={currencies}
								/>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Total price"
								name="total_price"
							>
								<PriceInput
									disabled
									currency={parentData.currency_id}
									currencyOptions={currencies}
								/>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Total discount"
								name="total_discount"
							>
								<PriceInput
									disabled
									currency={parentData.currency_id}
									currencyOptions={currencies}
								/>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Total final price"
								name="total_final_price"
							>
								<PriceInput
									disabled
									currency={parentData.currency_id}
									currencyOptions={currencies}
								/>
							</Form.Item>
						</Col>
						<Col span={8}>
							<Form.Item
								label="Total cost"
								name="total_cost"
							>
								<PriceInput
									disabled
									currency={
										parentData.company_currency_id || parentData.currency_id
									}
									currencyOptions={currencies}
								/>
							</Form.Item>
						</Col>
					</Row>
				</Spin>
			</Form>
		</Drawer>
	);
};
export default DrawerItem;