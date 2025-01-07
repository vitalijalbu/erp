import React from "react";
import {
	Button,
	Popover,
	Space,
	Tooltip,
	Flex,
	Typography,
	message,
	Dropdown,
	Modal,
} from "antd";
const { confirm } = Modal;
import { dateFormatter } from "@/hooks/formatter";
import PriceDisplay from "@/shared/components/price-display";
import {
	IconBan,
	IconCheck,
	IconReceiptDollar,
	IconSettings2,
	IconCaretDownFilled,
} from "@tabler/icons-react";
import { updateRowState } from "@/api/orders";
import _ from "lodash";

import ConfigurationDetailsTable from "@/shared/items/configuration-details-table";
/* import { useRouter } from "next/router";
 */ import UserPermissions from "@/policy/ability";
import { createOverrideDiscount } from "@/api/sales/discount";
import Link from "next/link";

function useColumnShow(
	toggleModalPrice,
	wrapText,
	currency_id,
	company_currency_id,
	currencies,
	setReload,
	id,
	setLoading,
	data
) {
	const { Text } = Typography;

	const canDoIt = UserPermissions.authorizePage(
		"sales_override_discount.manage"
	);

	// Toggle Row Status	
	const handleChangeStatus = async (idRow, status) => {
		confirm({
		  title: "Confirm Row change State",
		  transitionName: "ant-modal-slide-up",
		  content: "Are you sure you want to change the state?",
		  okText: "Continue",
		  cancelText: "Cancel",
		  async onOk() {
			try {
			setLoading(true);
			  const { data, error, errorMsg } = await updateRowState(idRow, status);
			  if (error) {
				message.error(errorMsg);
			  } else {
				message.success("Row updated succesfully.");
				setReload((prev) => prev + 1);
			  }
			} catch (error) {
				message.error("Error during saving operation");
			}
			setLoading(false);
		  },
		});
	  };

	// Define Dropdown Items
	const items = (idRow) => {
		return {
			items: [
				{
					key: "cancel",
					label: (
						<Link href="#" onClick={() => handleChangeStatus(idRow, "canceled")}>
							Cancel
						</Link>
					),
				},
				{
					key: "close",
					label: (
						<Link href="#" onClick={() => handleChangeStatus(idRow, "closed")}>
							Close
						</Link>
					),
				},
			],
		};
	};


	const stateColors = {
		closed: "red",
		canceled: "red",
		active: "green",
	};

	const approveOverride = async (row_id, approve) => {
		setLoading(true);
		const { status, error, errorMsg, validationErrors } =
			await createOverrideDiscount(id, { row_id, approve });
		if (error) {
			message.error(errorMsg);
		} else {
			message.success("Override saved successfully");
			setReload((prev) => prev + 1);
		}
		setLoading(false);
	};

	const tableColumns = [
		{
			title: "Position",
			dataIndex: "position",
			width: 50,
			key: "position",
		},
		{
			title: "State",
			// dataIndex: "state",
			key: "state",
			render: (state, record, index) => {
				return record.available_state_transitions.length !== 0 &&
					_.includes(["approved", "inserted"], data.state) ? (
					<Dropdown
						menu={items(record.id)}
						trigger={["click"]}
					>
						<Space.Compact style={{ marginRight: "5px" }}>
							<Button
								style={{
									color: stateColors[record.state],
									borderColor: stateColors[record.state],
								}}
							>
								{record.state}
							</Button>
							{record.available_state_transitions.length !== 0 &&
								_.includes(["approved", "inserted"], data.state) && (
									<Button
										icon={<IconCaretDownFilled />}
										style={{
											padding: "0 0 3px",
											color: stateColors[record.state],
											borderColor: stateColors[record.state],
										}}
									/>
								)}
						</Space.Compact>
					</Dropdown>
				) : (
					<Button
						style={{
							color: stateColors[record.state],
							borderColor: stateColors[record.state],
							marginRight: "5px",
						}}
					>
						{record.state}
					</Button>
				);
			},
		},

		{
			title: "Item",
			key: "item",
			width: 240,
			render: ({ item, record }) => (
				<Flex align='center'>
					<div>
						<b>{wrapText(item?.item, 40, true)}</b>
						<br />
						{wrapText(item?.item_desc, 40, true, { style: { fontSize: 12 } })}
					</div>
					{item?.configured_item && (
						<Popover
							placement='right'
							align={"top"}
							content={
								<ConfigurationDetailsTable
									configuration={item?.configuration_details}
								></ConfigurationDetailsTable>
							}
							title='Item Configuration'
						>
							<Button
								type='link'
								style={{ padding: "0 5" }}
							>
								<IconSettings2></IconSettings2>
							</Button>
						</Popover>
					)}
				</Flex>
			),
		},
		{
			title: "Qty",
			width: 50,
			render: (record) => (
				<span>
					{record.quantity} {record.item.um}
				</span>
			),
		},
		{
			title: "Delivery date",
			key: "delivery_date",
			width: 240,
			render: ({ delivery_date }) => dateFormatter(delivery_date),
		},
		{
			title: "Order Type",
			dataIndex: "order_type_id",
			width: 240,
			key: "order_type_id",
		},
		{
			title: "Workcenter",
			width: 240,
			dataIndex: ["workcenter", "name"],
			key: "workcenter",
		},
		{
			title: "Ref. order customer",
			width: 240,
			key: "customer_order_ref",
			render: (text) => <Text>{text?.customer_order_ref}</Text>,
		},
		{
			title: "Ref. A",
			width: 240,
			key: "order_ref_a",
			render: (text) => <Text>{text?.order_ref_a}</Text>,
		},
		{
			title: "Ref. B",
			width: 240,
			key: "order_ref_b",
			render: (text) => <Text>{text?.order_ref_b}</Text>,
		},
		{
			title: "Ref. C",
			width: 240,
			key: "order_ref_c",
			render: (text) => <Text>{text?.order_ref_c}</Text>,
		},

		{
			title: "Created at",
			width: 240,
			key: "created_at",
			render: ({ created_at }) => dateFormatter(created_at),
		},

		{
			title: "Destination Address",
			width: 240,
			render: ({ destination_address }) =>
				wrapText(destination_address?.full_address?.join(" "), 40, true),
		},
		{
			title: "Delivery Term",
			dataIndex: "delivery_term_id",
			width: 240,
			key: "delivery_term_id",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Carrier",
			width: 240,
			dataIndex: ["carrier"],
			render: (carrier) => carrier?.desc,
		},
		{
			title: "Tax Code",
			dataIndex: "tax_code",
			width: 240,
			key: "tax_code",
		},

		{
			title: "Sale Note",
			dataIndex: "sale_note",
			width: 240,
			key: "sale_note",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Billing Note",
			dataIndex: "billing_note",
			width: 240,
			key: "billing_note",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Production Note",
			dataIndex: "production_note",
			width: 240,
			key: "production_note",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Shipping Note",
			dataIndex: "shipping_note",
			width: 240,
			key: "shipping_note",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Packaging Note",
			width: 240,
			dataIndex: "packaging_note",
			key: "packaging_note",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Discount Override",
			width: 240,
			key: "override_total_discount",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						price={record.override_total_discount}
						currencyId={"%"}
						currencyOptions={[{ id: "%", symbol: "%" }]}
					/>
				</>
			),
		},
		{
			title: "Discount Override Note",
			width: 240,
			dataIndex: "override_total_discount_note",
			key: "override_total_discount_note",
			render: (text) => wrapText(text, 40, true),
		},

		{
			title: "Total Cost",
			width: 240,
			align: "right",
			key: "total_cost",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						price={record.total_cost || 0}
						currencyId={currency_id}
						currencyOptions={currencies}
					/>
				</>
			),
		},
		{
			title: "Total Discount",
			width: 240,
			align: "right",
			key: "total_discount",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						price={record.total_discount || 0}
						currencyId={currency_id}
						currencyOptions={currencies}
					/>
				</>
			),
		},
		{
			title: "Total Price",
			width: 240,
			align: "right",
			key: "total_price",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						price={record.total_price || 0}
						currencyId={currency_id}
						currencyOptions={currencies}
					/>
				</>
			),
		},
		{
			title: "Total Final Price",
			width: 240,
			align: "right",
			key: "total_final_price",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						price={record.total_final_price}
						currencyId={currency_id}
						currencyOptions={currencies}
					/>
				</>
			),
		},
		{
			title: "Total Profit",
			width: 240,
			align: "right",
			key: "total_profit",
			render: (text, record, index) => (
				<>
					<PriceDisplay
						currencyId={company_currency_id || currency_id}
						currencyOptions={currencies}
						price={record.total_profit || 0}
						style={{ background: "gold", borderRadius: "8px" }}
					/>
				</>
			),
		},

		{
			title: "Override discount",
			width: 160,
			key: "override_total_discount_to_approve",
			align: "right",
			fixed: "right",
			render: (text, record, index) => {
				return !!record?.override_total_discount_to_approve ? (
					canDoIt ? (
						<>
							{record.override_total_discount && (
								<Text style={{ marginRight: 20 }}>
									{record?.override_total_discount}%
								</Text>
							)}
							<Tooltip title='Approve Override Discount'>
								<Button
									icon={<IconCheck color='#33855c' />}
									onClick={() => {
										approveOverride(record?.id, true);
									}}
								/>
							</Tooltip>
							<Tooltip title='Reject Override Discount'>
								<Button
									icon={<IconBan color='#ff0000' />}
									onClick={() => {
										approveOverride(record?.id, false);
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
					<Tooltip title='Prices Details'>
						<Button
							icon={<IconReceiptDollar />}
							onClick={() => toggleModalPrice(record)}
						/>
					</Tooltip>
				</Space.Compact>
			),
		},
	];

	return tableColumns;
}

export { useColumnShow };
