import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
const { Text } = Typography;
import SelectOrderType from "@/shared/form-fields/select-order-type";
import {
	IconCurrencyDollar,
	IconPencilMinus,
	IconReceiptDollar,
	IconTrash,
	IconCheck,
	IconBan,
} from "@tabler/icons-react";
import ItemAutocomplete from "@/shared/form-fields/items/item-autocomplete";
import SelectBP from "@/shared/form-fields/bp/select-bp";
import SelectDeliveryTerm from "@/shared/form-fields/bp/select-delivery-term";
import SelectDateCheck from "@/shared/form-fields/select-date-check";
import SelectBPAddress from "@/shared/form-fields/bp/select-bp-address";
import SelectWorkcenter from "@/shared/form-fields/select-workcenter";
import PriceInput from "@/shared/form-fields/price-input";
import { Button, Input, InputNumber, Space, Tooltip } from "antd";
import { Typography } from "antd";
import UserPermissions from "@/policy/ability";
import PriceDisplay from "@/shared/components/price-display";
import { TextInput } from "@/shared/form-fields/TextInput";
export function columnQuotations(
	handleInput,
	handleDataSort,
	sortedInfo,
	errorMessage,
	handleDelete,
	togglePopup,
	toggleModalPrice,
	data,
	currencies,
	itemRows,
	setItemRows,
	isConversion,
	approveOverride,
	removeOverride,
	setRemoveOverride
) {
	const canDoIt = UserPermissions.authorizePage(
		"sales_override_discount.manage"
	);

	const tableColumns =
		[
			{
				title: "Position",
				key: "position",
				sorter: (a, b) => a.position - b.position,
				sortOrder:
					sortedInfo.columnKey === "position" ? sortedInfo.order : null,
				sortIcon: () => <></>,
				fixed: "left",
				width: 120,
				render: (text, record, index) => (
					<>
						<InputNumber
							id={"position-" + index}
							name='position'
							type='number'
							step={10}
							controls={false}
							value={record.position}
							status={record.errors?.position ? "error" : null}
							onBlur={({ target }) => handleDataSort(target.value, index)}
							onKeyDown={(event) => {
								if (event.code === "Enter" || event.code === "NumpadEnter") {
									event.preventDefault();
									event.stopPropagation();
									handleDataSort(event.target.value, index);
								}
							}}
						/>
						{record.errors?.position ? errorMessage("position", index) : null}
					</>
				),
			},
			{
				title: "Date",
				width: 120,
				key: "created_at",
				render: (text, record, index) => (
					<Text strong>{dayjs(record.created_at).format("YYYY-MM-DD")}</Text>
				),
			},
			{
				title: "Item",
				width: 240,
				key: "item_id",
				render: (text, record, index) => {
					return (
						<>
							<ItemAutocomplete
								itemValue={record.item_id}
								stdValue={record.standard_product_id}
								configuration={record.configuration}
								bp={data?.bp_id || null}
								status={
									record.errors?.[`item_id`] ||
									record.errors?.[`standard_product_id`] ||
									record.errors?.[`configuration`]
										? "error"
										: null
								}
								onItemChange={(value, type, um) => {
									itemRows[index].item_type = type;
									itemRows[index].um = um;
									itemRows[index].standard_product_id = null;
									handleInput(index, "item_type", type);
									handleInput(index, "um", um);
									handleInput(index, "standard_product_id", null);
									handleInput(index, "item_id", value);
								}}
								onStdChange={(value, type, um) => {
									itemRows[index].item_type = type;
									itemRows[index].um = um;
									itemRows[index].item_id = null;
									handleInput(index, "standard_product_id", value);
								}}
								onConfigurationSaved={(value) => {
									handleInput(index, "configuration", value);
								}}
								resetData={() => {
									handleInput(index, "reset_item", true);
								}}
							/>
							{record.errors?.[`item_id`]
								? errorMessage("item_id", index)
								: null}
							{record.errors?.[`standard_product_id`]
								? errorMessage("standard_product_id", index)
								: null}
							{record.errors?.[`configuration`]
								? errorMessage("configuration", index)
								: null}
						</>
					);
				},
			},
			{
				title: "Qty",
				width: 100,
				key: "quantity",
				render: (text, record, index) => (
					<>
						<InputNumber
							value={record.quantity}
							status={record.errors?.[`quantity`] ? "error" : null}
							type='number'
							min={1}
							addonAfter={record.um}
							controls={false}
							// onChange={(value) => {
							// 	handleInput(index, "quantity", value);
							// }}
							onBlur={({ target }) =>
								handleInput(index, "quantity", target.value)
							}
							onKeyDown={(event) => {
								if (event.code === "Enter" || event.code === "NumpadEnter") {
									event.preventDefault();
									event.stopPropagation();
									handleInput(index, "quantity", event.target.value);
								}
							}}
						/>
						{record.errors?.[`quantity`] ? (
							errorMessage("quantity", index)
						) : (
							<></>
						)}
					</>
				),
			},
			{
				title: "Delivery Date",
				width: 240,
				key: "delivery_date",
				render: (text, record, index) => {
					return (
						record?.item?.type !== "service" && record?.item_type !== "service" && (
							<>
								<SelectDateCheck
									value={
										dayjs(record.delivery_date, "YYYY-MM-DD").isValid()
											? dayjs(record.delivery_date, "YYYY-MM-DD")
											: null
									}
									status={record.errors?.[`delivery_date`] ? "error" : null}
									onChange={(value) =>
										handleInput(
											index,
											"delivery_date",
											value ? dayjs(value, "YYYY-MM-DD") : null
										)
									}
								/>
								{record.errors?.[`delivery_date`]
									? errorMessage("delivery_date", index)
									: null}
							</>
						)
					);
				},
			},
			{
				title: "Order Type",
				width: 240,
				key: "order_type_id",
				render: (text, record, index) => (
					<>
						<SelectOrderType
							value={record.order_type_id}
							status={record.errors?.[`order_type_id`] ? "error" : null}
							onChange={(value) => {
								handleInput(index, "order_type_id", value);
							}}
						/>
						{record.errors?.[`order_type_id`]
							? errorMessage("order_type_id", index)
							: null}
					</>
				),
			},
			// ----------------------------- refs ------------------------------------------------------
			{
				title: "Ref. order customer",
				width: 240,
				key: "customer_order_ref",
				// dataIndex: "customer_order_ref",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.customer_order_ref}
							status={record.errors?.[`customer_order_ref`] ? "error" : null}
							// allowClear
							// onChange={(event) => {
							// 	handleInput(index, "packaging_note", event.target.value);
							// }}
							onBlur={(value) =>
								handleInput(index, "customer_order_ref", value)
							}
							onEnter={(value) => {
								handleInput(index, "customer_order_ref", value);
							}}
						/>
						{record.errors?.[`customer_order_ref`]
							? errorMessage("customer_order_ref", index)
							: null}
					</>
				),
			},
			{
				title: "Ref. A",
				width: 240,
				key: "order_ref_a",
				// dataIndex: "order_ref_a",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.order_ref_a}
							status={record.errors?.[`order_ref_a`] ? "error" : null}
							// allowClear
							// onChange={(event) => {
							// 	handleInput(index, "packaging_note", event.target.value);
							// }}
							onBlur={(value) => handleInput(index, "order_ref_a", value)}
							onEnter={(value) => {
								handleInput(index, "order_ref_a", value);
							}}
						/>
						{record.errors?.[`order_ref_a`]
							? errorMessage("order_ref_a", index)
							: null}
					</>
				),
			},
			{
				title: "Ref. B",
				width: 240,
				key: "order_ref_b",
				// dataIndex: "order_ref_b",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.order_ref_b}
							status={record.errors?.[`order_ref_b`] ? "error" : null}
							// allowClear
							// onChange={(event) => {
							// 	handleInput(index, "packaging_note", event.target.value);
							// }}
							onBlur={(value) => handleInput(index, "order_ref_b", value)}
							onEnter={(value) => {
								handleInput(index, "order_ref_b", value);
							}}
						/>
						{record.errors?.[`order_ref_b`]
							? errorMessage("order_ref_b", index)
							: null}
					</>
				),
			},
			{
				title: "Ref. C",
				width: 240,
				key: "order_ref_c",
				// dataIndex: "order_ref_c",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.order_ref_c}
							status={record.errors?.[`order_ref_c`] ? "error" : null}
							// allowClear
							// onChange={(event) => {
							// 	handleInput(index, "packaging_note", event.target.value);
							// }}
							onBlur={(value) => handleInput(index, "order_ref_c", value)}
							onEnter={(value) => {
								handleInput(index, "order_ref_c", value);
							}}
						/>
						{record.errors?.[`order_ref_c`]
							? errorMessage("order_ref_c", index)
							: null}
					</>
				),
			},

			// ----------------------------- refs ------------------------------------------------------
			{
				title: "Destination Address",
				width: 240,
				key: "destination_address_id",
				render: (text, record, index) =>
					record?.item?.type !== "service" && record?.item_type !== "service" && (
						<>
							<SelectBPAddress
								value={record.destination_address_id}
								status={
									record.errors?.[`destination_address_id`] ? "error" : null
								}
								idBP={data?.bp_id || null}
								type='shipping'
								onChange={(value) => {
									handleInput(index, "destination_address_id", value);
								}}
							/>
							{record.errors?.[`destination_address_id`]
								? errorMessage("destination_address_id", index)
								: null}
						</>
					),
			},
			{
				title: "Delivery Term",
				width: 240,
				key: "delivery_term_id",
				render: (text, record, index) =>
					record?.item?.type !== "service" && record?.item_type !== "service" && (
						<>
							<SelectDeliveryTerm
								value={_.get(record, "delivery_term_id", null)}
								status={record.errors?.[`delivery_term_id`] ? "error" : null}
								onChange={(value) => {
									handleInput(index, "delivery_term_id", value);
								}}
							/>
							{record.errors?.[`delivery_term_id`]
								? errorMessage("delivery_term_id", index)
								: null}
						</>
					),
			},
			{
				title: "Workcenter",
				width: 240,
				key: "workcenter_id",
				render: (text, record, index) =>
					record.item_type !== "workcenter_id" && (
						<>
							<SelectWorkcenter
								value={record.workcenter_id}
								status={record.errors?.[`workcenter_id`] ? "error" : null}
								onChange={(value) => {
									handleInput(index, "workcenter_id", value);
								}}
								// setDefault={(value) => {
								// 	handleInput(index, "workcenter_id", value);
								// }}
							/>
							{record.errors?.[`workcenter_id`]
								? errorMessage("workcenter_id", index)
								: null}
						</>
					),
			},
			{
				title: "Carrier",
				width: 240,
				key: "carrier_id",
				render: (text, record, index) =>
					record?.item?.type !== "service" && record?.item_type !== "service" && (
						<>
							<SelectBP
								value={record.carrier_id}
								status={record.errors?.[`carrier_id`] ? "error" : null}
								filter={{ columns: { is_carrier: { search: { value: 1 } } } }}
								placeHolder={"Select carrier"}
								onChange={(value) => {
									handleInput(index, "carrier_id", value);
								}}
							/>
							{record.errors?.[`carrier_id`]
								? errorMessage("carrier_id", index)
								: null}
						</>
					),
			},
			{
				title: "Tax code",
				width: 240,
				key: "tax_code",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.tax_code}
							status={record.errors?.[`tax_code`] ? "error" : null}
							onBlur={(value) => handleInput(index, "tax_code", value)}
							onEnter={(value) => {
								handleInput(index, "tax_code", value);
							}}
						/>
						{record.errors?.[`tax_code`]
							? errorMessage("tax_code", index)
							: null}
					</>
				),
			},
			{
				title: "Sale note",
				width: 240,
				key: "sale_note",
				dataIndex: "sale_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.sale_note}
							status={record.errors?.[`sale_note`] ? "error" : null}
							onBlur={(value) => handleInput(index, "sale_note", value)}
							onEnter={(value) => {
								handleInput(index, "sale_note", value);
							}}
						/>
						{record.errors?.[`sale_note`]
							? errorMessage("sale_note", index)
							: null}
					</>
				),
			},
			{
				title: "Billing note",
				width: 240,
				key: "billing_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.billing_note}
							status={record.errors?.[`billing_note`] ? "error" : null}
							onBlur={(value) => handleInput(index, "billing_note", value)}
							onEnter={(value) => {
								handleInput(index, "billing_note", value);
							}}
						/>
						{record.errors?.[`billing_note`]
							? errorMessage("billing_note", index)
							: null}
					</>
				),
			},
			{
				title: "Production note",
				width: 240,
				key: "production_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.production_note}
							status={record.errors?.[`production_note`] ? "error" : null}
							onBlur={(value) => handleInput(index, "production_note", value)}
							onEnter={(value) => {
								handleInput(index, "production_note", value);
							}}
						/>
						{record.errors?.[`production_note`]
							? errorMessage("production_note", index)
							: null}
					</>
				),
			},
			{
				title: "Shipping note",
				width: 240,
				key: "shipping_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.Shipping}
							status={record.errors?.[`Shipping`] ? "error" : null}
							onBlur={(value) => handleInput(index, "Shipping", value)}
							onEnter={(value) => {
								handleInput(index, "Shipping", value);
							}}
						/>
						{record.errors?.[`shipping_note`]
							? errorMessage("production_note", index)
							: null}
					</>
				),
			},
			{
				title: "Packaging note",
				width: 240,
				key: "packaging_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.packaging_note}
							status={record.errors?.[`packaging_note`] ? "error" : null}
							onBlur={(value) => handleInput(index, "packaging_note", value)}
							onEnter={(value) => {
								handleInput(index, "packaging_note", value);
							}}
						/>
						{record.errors?.[`packaging_note`]
							? errorMessage("packaging_note", index)
							: null}
					</>
				),
			},
			{
				title: "Discount Override",
				width: 240,
				key: "override_total_discount",
				render: (text, record, index) => {
					return (
						<>
							<PriceInput
								value={record.override_total_discount}
								currency={"%"}
								index={index}
								status={
									record.errors?.[`override_total_discount`] ? "error" : null
								}
								emitValueOnChange={false}
								onBlur={(value) =>
									handleInput(index, "override_total_discount", value)
								}
								onEnter={(value) => {
									handleInput(index, "override_total_discount", value);
								}}
								currencyOptions={[{ id: "%", symbol: "%" }]}
								showSymbolSelection
							/>
							{record.errors?.[`override_total_discount`]
								? errorMessage("override_total_discount", index)
								: null}
						</>
					);
				},
			},
			{
				title: "Discount Override Notes",
				width: 240,
				key: "override_total_discount_note",
				render: (text, record, index) => (
					<>
						<TextInput
							value={record.override_total_discount_note}
							status={
								record.errors?.[`override_total_discount_note`] ? "error" : null
							}
							disable={_.isNil(record.override_total_discount)}
							onBlur={(value) =>
								handleInput(index, "override_total_discount_note", value)
							}
							onEnter={(value) => {
								handleInput(index, "override_total_discount_note", value);
							}}
						/>
						{record.errors?.[`override_total_discount_note`]
							? errorMessage("override_total_discount_note", index)
							: null}
					</>
				),
			},
			{
				title: "Total Cost",
				align: "right",
				width: 240,
				key: "total_cost",
				render: (text, record, index) => (
					<>
						<PriceDisplay
							price={record.total_cost || 0}
							currencyId={data?.company_currency_id || data?.currency_id}
							currencyOptions={currencies}
						/>
						{record.errors?.[`cost`] ? errorMessage("cost", index) : null}
					</>
				),
			},
			{
				title: "Total Discount",
				width: 240,
				align: "right",
				key: "total_discount",
				render: (text, record, index) => {
					return (
						<>
							<PriceDisplay
								price={record.total_discount}
								currencyId={data?.currency_id}
								currencyOptions={currencies}
							/>
							{record.errors?.[`total_discount`]
								? errorMessage("total_discount", index)
								: null}
						</>
					);
				},
			},
			{
				title: "Total Price",
				width: 240,
				align: "right",
				key: "total_price",
				render: (text, record, index) => (
					<>
						<PriceDisplay
							price={record.total_price}
							currencyId={data?.currency_id}
							currencyOptions={currencies}
						/>
						{record.errors?.[`total_price`]
							? errorMessage("total_price", index)
							: null}
					</>
				),
			},
			{
				title: "Total Final Price",
				width: 240,
				align: "right",
				key: "total_final_price",
				render: (text, record, index) => {
					return (
						<>
							<PriceDisplay
								price={record.total_final_price}
								currencyId={data?.currency_id}
								currencyOptions={currencies}
							/>
							{record.errors?.[`total_final_price`]
								? errorMessage("total_final_price", index)
								: null}
						</>
					);
				},
			},
			{
				title: "Total Profit",
				width: 240,
				align: "right",
				key: "total_profit",
				render: (text, record, index) => (
					<>
						<PriceDisplay
							price={record.total_profit}
							currencyId={data?.company_currency_id || data?.currency_id}
							currencyOptions={currencies}
							style={{ background: "gold", borderRadius: "8px" }}
						/>
						{record.errors?.[`total_profit`]
							? errorMessage("total_profit", index)
							: null}
					</>
				),
			},
			{
				title: "Override discount",
				width: 160,
				key: "total_profit",
				align: "right",
				fixed: "right",
				render: (text, record, index) => {
					return !removeOverride?.includes(record?.id) &&
						!!itemRows[index]?.override_total_discount_to_approve ? (
						canDoIt ? (
							<>
								{itemRows[index]?.override_total_discount && (
									<Text style={{ marginRight: 20 }}>
										{itemRows[index]?.override_total_discount}%
									</Text>
								)}
								<Tooltip title='Approve Override Discount'>
									<Button
										icon={<IconCheck color='#33855c' />}
										onClick={() => {
											approveOverride(record?.id, true);
											setRemoveOverride([...removeOverride, record?.id]);
										}}
									/>
								</Tooltip>
								<Tooltip title='Reject Override Discount'>
									<Button
										icon={<IconBan color='#ff0000' />}
										onClick={() => {
											approveOverride(record?.id, false);
											handleInput(index, "override_total_discount", null);
											setRemoveOverride([...removeOverride, record?.id]);
										}}
									/>
								</Tooltip>
							</>
						) : (
							<>
								<Text
									color='gold'
									style={{ color: "#f5cf04", fontSize: 14 }}
								>
									Waiting to be approved
								</Text>
							</>
						)
					) : null;
				},
			},
			{
				title: "Actions",
				width: 80,
				key: "actions",
				align: "right",
				fixed: "right",
				className: "table-actions",
				render: (text, record, index) => (
					<Space.Compact>
						<Tooltip title='Calculate prices'>
							<Button
								icon={<IconCurrencyDollar />}
								disabled={
									_.isNull(record.item_id) &&
									_.isNull(record.standard_product_id) &&
									_.isNull(record.configuration)
								}
								onClick={() =>
									handleInput(index, "force_price_processing", true)
								}
							/>
						</Tooltip>
						<Tooltip title='Prices Details'>
							<Button
								icon={<IconReceiptDollar />}
								disabled={
									(_.isNull(record.item_id) &&
										_.isNull(record.standard_product_id) &&
										_.isNull(record.configuration)) ||
									_.has(record, "isPriceCalcFailed")
								}
								onClick={() => toggleModalPrice(record)}
							/>
						</Tooltip>

						<Button
							icon={<IconPencilMinus />}
							onClick={() => togglePopup(record, index)}
						/>

						{!isConversion && (
							<Button
								icon={<IconTrash color='#e24004' />}
								onClick={() => handleDelete(index)}
							/>
						)}
					</Space.Compact>
				),
			},
		] || [];
	return tableColumns;
}
