import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { createSale, getSaleById, updateSale } from "@/api/orders";
import { useValidationErrors } from "@/hooks/validation-errors";
import {
	Card,
	Button,
	Col,
	Divider,
	Form,
	Input,
	Row,
	List,
	Space,
	message,
	Alert,
	DatePicker,
} from "antd";
//import LastActivity from "@/shared/users/last-activity";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import dayjs from "dayjs";
import { useSetRecoilState } from "recoil";
import { reloadAtom } from "@/store/sidenav";
import SelectDateCheck from "@/shared/form-fields/select-date-check";
import SelectCurrency from "@/shared/form-fields/select-currency";
import SelectContact from "@/shared/form-fields/select-contact";
import SelectOrderType from "@/shared/form-fields/select-order-type";
//import SelectOrderstate from "@/shared/form-fields/sales/select-order-state";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import PageActions from "@/shared/components/page-actions";
import SelectPaymentTerm from "@/shared/form-fields/bp/select-payment-term";
import SelectPaymentMethod from "@/shared/form-fields/bp/select-payment-method";
import SelectDeliveryTerm from "@/shared/form-fields/bp/select-delivery-term";
import SelectBPAddress from "@/shared/form-fields/bp/select-bp-address";
import TableRows from "@/shared/sales/quotations/table-rows";
import SelectSaleSequence from "@/shared/form-fields/sales/select-sale-sequence";
import { getAllCurrencies, getBPById } from "@/api/bp";
import PriceDisplay from "@/shared/components/price-display";
import { createOverrideDiscount } from "@/api/sales/discount";
import { PRICE_CALCULATION_KEYS } from "@/shared/sales/quotations/table-rows";
import ActionRows from "../action-rows";
const FormBody = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const setReloadBadge = useSetRecoilState(reloadAtom);

	const [form] = Form.useForm();
	const formBody = Form.useWatch([], { form, preserve: true });
	const [isFormChanged, setIsFormChanged] = useState(false);
	const validationErrorsBag = useValidationErrors();
	const [loading, setLoading] = useState(true);
	const [reload, setReload] = useState(0);
	const [rows, setRows] = useState([]);
	const [data, setData] = useState({});
	const [dataBP, setDataBP] = useState({});
	const [allCurrencies, setAllCurrencies] = useState([]);
	const recalculate = useRef(null);
	const [openedPopup, setOpenedPopup] = useState(false);
    const [targetItem, setTarget] = useState(null);

	    // Toggle Drawer inside Children Component
		const togglePopup = (record) => {
			if (record) {
				setTarget(record);
			}
			setOpenedPopup(!openedPopup);
		};
	

	const approveOverride = async (row_id, approve) => {
		const { status, error, errorMsg, validationErrors } = await createOverrideDiscount(id, {
			row_id,
			approve,
		});
		if (error) {
			message.error(errorMsg);
			setLoading(false);
		} else {
			message.success("Override saved successfully");
			setReloadBadge((prev) => prev + 1);
			setLoading(false);
			const rowsClone = [...rows];
			let approveIndex = rowsClone.findIndex((x) => x.id === row_id);
			if (approveIndex !== -1)
				rowsClone[approveIndex].override_total_discount_to_approve = null;
			setRows(rowsClone);
		}
	};

	const [calculatedPrices, setCalculatedPrices] = useState({
		total_costs: 0,
		total_discount_override: 0,
		total_discount: 0,
		total_final_price: 0,
		total_profit: 0,
		total_price: 0,
	});

	const UpdateClaulatedPrices = () => {
		setCalculatedPrices({
			total_costs: _.sum(_.map(rows, "total_cost")),
			total_discount: _.sum(_.map(rows, "total_discount")),
			total_final_price: _.sum(_.map(rows, "total_final_price")),
			total_profit: _.sum(_.map(rows, "total_profit")),
			total_price: _.sum(_.map(rows, "total_price")),
		});
	};

	/// Function to handle role change
	const handleRowsChange = (values, fieldName = null) => {
		// Merge the existing rows with the new values and update the state
		//const updatedRows = _.merge({}, rows, values);
		setRows(values);

		recalculate.current = fieldName;
	};
	useEffect(() => {
		if (!recalculate.current || PRICE_CALCULATION_KEYS.includes(recalculate.current)) {
			UpdateClaulatedPrices();
		}
	}, [rows]);
	// Get API data BP to set default data inside form fileds
	useEffect(() => {
		// tyo find a better solution
		if (formBody?.bp_id && formBody?.bp_id !== null && !id) {
			getBPById(formBody?.bp_id).then(({ data, error }) => {
				if (!error) {
					setDataBP(data || {});
					// Change form values based on BP selected
					form.setFieldsValue({
						currency_id: data?.currency_id,
						payment_method_code: data?.invoice_payment_method_id,
						payment_term_code: data?.invoice_payment_term_id,
						delivery_term_id: data?.shipping_delivery_term_id,
						carrier_id: data?.shipping_carrier_id,
						sales_internal_contact_id: data?.sales_internal_contact_id,
						sales_external_contact_id: data?.sales_external_contact_id,
						order_type_id: data?.sales_order_type_id,
						destination_address_id: data?.shipping_address_id,
						invoice_address_id: data?.invoice_address_id,
					});
					setLoading(false);
				} else {
					message.error("An error occurred while fetching API");
					setLoading(false);
				}
			});
		}
	}, [formBody?.bp_id]);

	// Submit form[reload]
	const handleSubmit = async () => {
		let response; // Declare response outside the try-catch block
		setLoading(true);
		try {
			validationErrorsBag.clear();
			// Extract data form
			const updatedValues = _.merge(form.getFieldsValue(), {
				sale_type: "quotation",
				delivery_date: dayjs(formBody["delivery_date"]).format("YYYY-MM-DD"),
				expires_at: dayjs(formBody["expires_at"]).format("YYYY-MM-DD"),
				sale_rows: _.map(rows, (row) =>
					_.merge(row, {
						delivery_date: row["delivery_date"]
							? dayjs(row["delivery_date"]).format("YYYY-MM-DD")
							: null,
						created_at: dayjs(row["created_at"]).format("YYYY-MM-DD"),
						configuration: row["item_id"] ? null : row["configuration"],
					})
				),
			});
			if (id) {
				response = await updateSale(id, _.omit(updatedValues, "sale_sequence_id"));
			} else {
				response = await createSale(updatedValues);
			}

			const { error, data, validationErrors, errorMsg } = response;

			if (error) {
				if (validationErrors) {
					validationErrorsBag.setValidationErrors(validationErrors);
				}
				message.error(errorMsg);
				setLoading(false);
			} else {
				message.success("Quotation saved successfully");
				// push route
				router.push(`/sales/quotations/${data?.id}`);
				setReloadBadge((prev) => prev + 1);
			}
		} catch (error) {
			// Handle unexpected errors
			message.error("An unexpected error occurred");
			setLoading(false);
		} finally {
			// Only set loading to false if there is no error
			if (!response || !response.error) {
				setLoading(false);
			}
		}
	};

	// Get BP details
	useEffect(() => {
		if (router.isReady) {
			// Get ID BP and set data state
			setLoading(true);
			if (id) {
				let formattedData;
				(async () => {
					const { data, error } = await getSaleById(id);
					if (!error) {
						// Set state contacts required here
						let localRows = _.map(data?.sale_rows, (selected) => {
							return {
								...selected,
								um: selected?.item?.um,
								created_at: dayjs(selected.created_at, "YYYY-MM-DD"),
								delivery_date: selected.item.type == "service" ? null : dayjs(selected.delivery_date, "YYYY-MM-DD"),
							};
						});
						setRows(localRows);
						// Set form values
						const formattedData = {
							sale_type: "quotation",
							code: data?.code,
							bp_id: data?.bp_id,
							sale_sequence_id: data?.sale_sequence_id,
							order_type_id: data?.order_type_id,
							created_at: dayjs(data?.created_at, "YYYY-MM-DD"),
							delivery_date: data?.delivery_date
								? dayjs(data?.delivery_date, "YYYY-MM-DD")
								: null,
							expires_at: data?.expires_at
								? dayjs(data?.expires_at, "YYYY-MM-DD")
								: null,
							state: data?.state,
							customer_order_ref: data?.customer_order_ref,
							order_ref_a: data?.order_ref_a,
							order_ref_b: data?.order_ref_b,
							order_ref_c: data?.order_ref_c,
							destination_address_id: data?.destination_address_id,
							delivery_term_id: data?.delivery_term_id,
							invoice_address_id: data?.invoice_address_id,
							payment_term_code: data?.payment_term_code,
							payment_method_code: data?.payment_method_code,
							currency_id: data?.currency_id,
							sales_internal_contact_id: data?.sales_internal_contact_id,
							sales_external_contact_id: data?.sales_external_contact_id,
							carrier_id: data?.carrier_id,
							company_currency_id: data?.company_currency_id,
						};

						//set static data to pass everything between tabs
						setData(data);
						// set default form values
						form.setFieldsValue(formattedData);
					}
					setIsFormChanged(false);
				})();
			}

			(async () => {
				const { data, error } = await getAllCurrencies();
				!error ? setAllCurrencies(data) : message.error(error.message);
			})();
			setLoading(false);
		}
	}, [router.isReady, reload, id]);

	return (
		<div className="page">
			<PageActions
				backUrl="/sales/quotations"
				loading={loading}
				title={
					id ? (
						<>
							Edit quotation - <mark>{data?.code}</mark>
						</>
					) : (
						"Add new quotation"
					)
				}
				// extra={<LastActivity data={null} />}
				extra={[
					<Space key={0}>
						<Button
							key={"submit"}
							name="form-quotation"
							htmlType="submit"
							type="primary"
							form="form-quotation"
							//onClick={() => handleSubmit()}
							disabled={!isFormChanged}
						>
							{id ? "Update" : "Create"}
						</Button>
					</Space>,
				]}
			>
				{isFormChanged && (
					<Alert
						message="The form has changes. please save before moving away."
						type="warning"
						showIcon
					/>
				)}
				{isFormChanged && _.some(form.getFieldValue("rows"), "force_price_processing") && (
					// Todo change message
					<Alert
						message="The Prices are been recalculated manually! It may differ a previous calculation."
						type="warning"
						showIcon
					/>
				)}
			</PageActions>
			<div className="page-content">
				<Form
					form={form}
					name="form-quotation"
					layout="vertical"
					onFinish={handleSubmit}
					onValuesChange={() => setIsFormChanged(true)}
				>
					<Row gutter={16}>
						<Col span={18}>
							<Card
								title="Details quotation"
								className="mb-1"
								loading={loading}
								key={"card-" + 0}
							>
								<Row gutter={16}>
									<Col span={8}>
										<Form.Item
											name="bp_id"
											label="Business Partner"
											initialValue={null}
											{...validationErrorsBag.getInputErrors("bp_id")}
										>
											<SelectBP
												autofocus
												disabled={props.isConversion || rows.length > 0}
												onChange={(value) =>
													form.setFieldValue("bp_id", value)
												}
												filter={{
													columns: {
														is_active: {
															search: {
																value: 1,
															},
														},
														customer: {
															search: {
																value: 1,
															},
														},
														is_shipping: {
															search: {
																value: 1,
															},
														},
														is_sales: {
															search: {
																value: 1,
															},
														},
													},
												}}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Order type"
											name="order_type_id"
											{...validationErrorsBag.getInputErrors("order_type_id")}
										>
											<SelectOrderType />
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Sequence"
											name="sale_sequence_id"
											initialValue={_.get(formBody, "sale_sequence_id", null)}
											{...validationErrorsBag.getInputErrors(
												"sale_sequence_id"
											)}
										>
											<SelectSaleSequence
												onSetDefault={(value) =>
													form.setFieldValue("sale_sequence_id", value)
												}
												disabled={id}
												isLoading={loading}
												defaultField="quotation"
											/>
										</Form.Item>
									</Col>
								</Row>
								<Divider orientation="left">Dates</Divider>
								<Row gutter={16}>
									<Col span={8}>
										<Form.Item
											label="Date order"
											tooltip="Default date is today"
											name="created_at"
											initialValue={dayjs()}
										>
											<DatePicker
												disabled
												// value={dayjs().format("YYYY-MM-DD")}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Delivery date"
											tooltip="Dates are managed by calendar closing days"
											name="delivery_date"
											{...validationErrorsBag.getInputErrors("delivery_date")}
										>
											<SelectDateCheck />
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Expiration Date"
											name="expires_at"
											{...validationErrorsBag.getInputErrors("expires_at")}
											initialValue={dayjs().add(30, "days")} // add 30 days
										>
											<DatePicker
												format={[
													"YYYY-MM-DD",
													"DD-MM-YYYY",
													"YYYY/MM/DD",
													"DD/MM/YYYY",
												]}
												changeOnBlur={true}
											/>
										</Form.Item>
									</Col>
								</Row>
								<Divider orientation="left">Other references</Divider>
								<Row gutter={16}>
									<Col span={6}>
										<Form.Item
											label="Ref. order customer"
											name="customer_order_ref"
											{...validationErrorsBag.getInputErrors(
												"customer_order_ref"
											)}
										>
											<Input
												placeholder="Free text"
												allowClear
											/>
										</Form.Item>
									</Col>
									<Col span={6}>
										<Form.Item
											label="Ref. A"
											name="order_ref_a"
											{...validationErrorsBag.getInputErrors("order_ref_a")}
										>
											<Input
												placeholder="Free text"
												allowClear
											/>
										</Form.Item>
									</Col>
									<Col span={6}>
										<Form.Item
											label="Ref. B"
											name="order_ref_b"
											{...validationErrorsBag.getInputErrors("order_ref_b")}
										>
											<Input
												placeholder="Free text"
												allowClear
											/>
										</Form.Item>
									</Col>
									<Col span={6}>
										<Form.Item
											label="Ref. C"
											name="order_ref_c"
											{...validationErrorsBag.getInputErrors("order_ref_c")}
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
									<Col span={8}>
										<Form.Item
											label="Destination address"
											name="destination_address_id"
											{...validationErrorsBag.getInputErrors(
												"destination_address_id"
											)}
										>
											<SelectBPAddress
												key={"bp-" + 1}
												idBP={formBody?.bp_id || null}
												type="shipping"
												disabled={!form.getFieldValue("bp_id")}
												onChange={(value) =>
													form.setFieldValue(
														"destination_address_id",
														value
													)
												}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Carrier"
											name="carrier_id"
											{...validationErrorsBag.getInputErrors("carrier_id")}
										>
											<SelectBP
												key={1}
												onChange={(value) =>
													form.setFieldValue("carrier_id", value)
												}
												filter={{
													columns: {
														is_carrier: { search: { value: 1 } },
													},
												}}
											/>
										</Form.Item>
									</Col>
									<Col span={8}>
										<Form.Item
											label="Terms of Delivery"
											name="delivery_term_id"
											initialValue={_.get(formBody, "delivery_term_id", null)}
											{...validationErrorsBag.getInputErrors(
												"delivery_term_id"
											)}
										>
											<SelectDeliveryTerm />
										</Form.Item>
									</Col>
								</Row>
								<Divider orientation="left">Billing</Divider>
								<Row gutter={16}>
									<Col span={6}>
										<Form.Item
											label="Invoice address"
											name="invoice_address_id"
											{...validationErrorsBag.getInputErrors(
												"invoice_address_id"
											)}
										>
											<SelectBPAddress
												key={"bp-" + 2}
												idBP={formBody?.bp_id || null}
												type="invoice"
												disabled={!form.getFieldValue("bp_id")}
												onChange={(value) =>
													form.setFieldValue("invoice_address_id", value)
												}
											/>
										</Form.Item>
									</Col>
									{/* </Row>
								<Row gutter={16}> */}
									<Col span={6}>
										<Form.Item
											label="Payment term"
											name="payment_term_code"
											{...validationErrorsBag.getInputErrors(
												"payment_term_code"
											)}
										>
											<SelectPaymentTerm />
										</Form.Item>
									</Col>
									<Col span={6}>
										<Form.Item
											label="Payment method"
											name="payment_method_code"
											{...validationErrorsBag.getInputErrors(
												"payment_method_code"
											)}
										>
											<SelectPaymentMethod />
										</Form.Item>
									</Col>

									<Col span={6}>
										<Form.Item
											label="Currency"
											name="currency_id"
											{...validationErrorsBag.getInputErrors("currency_id")}
										>
											<SelectCurrency
												options={allCurrencies}
												disabled={id !== undefined || rows.length > 0}
												setDefault={() => {}}
											/>
										</Form.Item>
									</Col>

									<Col span={12}>
										<Form.Item
											label="Internal Sales Representative"
											name="sales_internal_contact_id"
											{...validationErrorsBag.getInputErrors(
												"sales_internal_contact_id"
											)}
										>
											<SelectContact
												onChange={(value) =>
													form.setFieldValue(
														"sales_internal_contact_id",
														value
													)
												}
												filter={{
													columns: {
														is_employee: { search: { value: 1 } },
													},
												}}
												onRemove={() =>
													form.resetFields(["sales_internal_contact_id"])
												}
											/>
										</Form.Item>
									</Col>
									<Col span={12}>
										<Form.Item
											label="External Sales Representative"
											name="sales_external_contact_id"
											{...validationErrorsBag.getInputErrors(
												"sales_external_contact_id"
											)}
										>
											<SelectContact
												key={`contact-` + 2}
												onChange={(value) =>
													form.setFieldValue(
														"sales_external_contact_id",
														value
													)
												}
												filter={{
													columns: {
														is_employee: { search: { value: 1 } },
													},
												}}
												onRemove={() =>
													form.resetFields(["sales_external_contact_id"])
												}
											/>
										</Form.Item>
										<Form.Item
											name={"sale_type"}
											hidden
											initialValue={"quotation"}
										>
											<Input />
										</Form.Item>
									</Col>
								</Row>
							</Card>
						</Col>
						<Col span={6}>
							<Card
								title="Calculated pricing"
								loading={loading}
								key={"card-" + 1}
								className="mb-3"
							>
								<List>
									<List.Item key={"total-costs"}>
										<List.Item.Meta title="Total Costs" />
										<div>
											<PriceDisplay
												currencyId={
													form.getFieldValue("company_currency_id") ||
													form.getFieldValue("currency_id")
												}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_costs}
											/>
										</div>
									</List.Item>
									<List.Item key={"total-discount"}>
										<List.Item.Meta title="Total Discount" />
										<div>
											<PriceDisplay
												currencyId={form.getFieldValue("currency_id")}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_discount}
											/>
										</div>
									</List.Item>
									<List.Item key={"total-price"}>
										<List.Item.Meta title="Total price" />
										<div>
											<PriceDisplay
												currencyId={form.getFieldValue("currency_id")}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_price}
											/>
										</div>
									</List.Item>
									<List.Item key={"total-final-price"}>
										<List.Item.Meta title="Total Final price" />
										<div>
											<PriceDisplay
												currencyId={form.getFieldValue("currency_id")}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_final_price}
											/>
										</div>
									</List.Item>
									<List.Item key={"total-profit"}>
										<List.Item.Meta title="Total Profit" />
										<div>
											<PriceDisplay
												currencyId={
													form.getFieldValue("company_currency_id") ||
													form.getFieldValue("currency_id")
												}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_profit}
											/>
										</div>
									</List.Item>
								</List>
							</Card>
							{/* Action Buttons Here */}
							<ActionRows 
								disabled={!formBody?.bp_id || formBody?.bp_id === null || formBody?.bp_id === undefined} 
								loading={loading}
								eventClick={(val) => togglePopup(val)}
							/>
						</Col>
					</Row>
					{/* Row Items */}
					<Row>
						<Col span={24}>
							<TableRows
								changesWatcher={(value) => setIsFormChanged(value)}
								onChange={(values, fieldName) =>
									handleRowsChange(values, fieldName)
								}
								rows={rows}
								saleId={id}
								approveOverride={approveOverride}
								data={formBody}
								 // new features
								 targetItem={targetItem}
								 openedPopup={openedPopup}
								 closePopup={() => setOpenedPopup(false)}
								 // end new features 
								errors={validationErrorsBag}
								loading={loading}
								selectable={!!id && props.isConversion}
								isConversion={props.isConversion}
								currencies={allCurrencies}
							/>
						</Col>
					</Row>
				</Form>
			</div>
		</div>
	);
};
export default FormBody;
