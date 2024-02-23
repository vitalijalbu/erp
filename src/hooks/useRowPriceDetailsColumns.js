import PriceDisplay from "@/shared/components/price-display";

export const itemPriceCols = (currencyId, currecies, companyCurrencyId) => {
	return [
		{
			title: "Item",
			key: "item",
			dataIndex: ["item"],
			width: "35%",
			render: (item) => <span>{item.item + " - " + item.item_desc}</span>,
		},
		{
			title: "Qty",
			key: "quantity",
			dataIndex: ["quantity"],
			width: "7%",
			// align: "right",
			render: (qty, record) => (
				<div className="text-right">
					{record.quantity} {record.item.um}
				</div>
			),
		},

		{
			title: "Unit Price",
			key: "price",
			// dataIndex: ["price"],
			width: "8%",
			// align: "right",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.price}
						currencyId={currencyId}
						currencyOptions={currecies}
					/>
					{record.sale_price_list && (
						<div className="text-muted text-xsmall">
							Pricelist: {record.sale_price_list?.code}
						</div>
					)}
				</>
			),
		},
		{
			title: "",
			width: "8%",
		},
		{
			title: "Unit Discount",
			key: "discount",
			// dataIndex: ["discount"],
			width: "8%",
			// align: "right",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.discount}
						currencyId={currencyId}
						currencyOptions={currecies}
					/>
					{record.sale_discount_matrix && (
						<div className="text-muted text-xsmall">
							Matrix Discount: {record.sale_discount_matrix?.description}
						</div>
					)}
				</>
			),
		},
		{
			title: "Unit Profit",
			key: "profit",
			width: "8%",
			// align: "right",
			dataIndex: ["profit"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Unit cost",
			key: "cost",
			width: "8%",
			// align: "right",
			dataIndex: ["cost"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Disc. Override",
			key: "override_total_discount",
			width: "8%",
			dataIndex: ["override_total_discount"],
			// align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={"%"}
					currencyOptions={[{ id: "%", symbol: "%" }]}
				/>
			),
		},
		{
			title: "Final Price",
			key: "final_price",
			width: "9%",
			// align: "right",
			dataIndex: ["final_price"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
	];
};
export const totalsPriceCols = (currencyId, currecies, companyCurrencyId) => {
	return [
		{
			title: "",
			width: "35%",
			align: "right",
			render: () => (
				<span>
					<strong> Totals :</strong>
				</span>
			),
		},
		{
			title: "Total Price",
			key: "total_price",
			dataIndex: ["total_price"],
			width: "10%",
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "",
			key: "total_discount",
			width: "10%",
			dataIndex: ["total_discount"],
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "",
			key: "total_profit",
			width: "10%",
			dataIndex: ["total_profit"],
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "",
			key: "total_cost",
			width: "10%",
			dataIndex: ["total_cost"],
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Final Price",
			key: "total_final_price",
			width: "10%",
			dataIndex: ["total_final_price"],
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "",
			key: "override_total_discount",
			width: "10%",
			dataIndex: ["override_total_discount"],
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={"%"}
					currencyOptions={[{ id: "%", symbol: "%" }]}
				/>
			),
		},
	];
};

export const componentCols = (currencyId, currecies, companyCurrencyId) => {
	return [
		{
			title: "Item",
			key: "item",
			dataIndex: ["item"],
			width: "25%",
			render: (item) => {
				return <>{item && <span>{item.item + " - " + item.item_desc}</span>}</>;
			},
		},
		{
			title: "Note",
			key: "note",
			dataIndex: ["note"],
			width: "10%",
			// render: (item) => {
			// 	return <>{item && <span>{item.item + " - " + item.item_desc}</span>}</>;
			// },
		},
		{
			title: "Qty",
			key: "quantity",
			dataIndex: ["quantity"],
			width: "7%",
			// align: "right",
			render: (qty, record) => (
				<div className="text-right">
					{qty} {record.item && <>{record.item.um}</>}
				</div>
			),
		},

		{
			title: "Unit Price",
			key: "price",
			// align: "right",
			// dataIndex: ["price"],
			width: "8%",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.price}
						currencyId={currencyId}
						currencyOptions={currecies}
						maxDecimals={4}
						minDecimals={4}
					/>
					{/* {record.sale_price_list && (
						<div className="text-muted text-xsmall">
							Pricelist: {record.sale_price_list?.code}
						</div>
					)} */}
				</>
			),
		},
		{
			title: "Pricelist",
			key: "sale_price_list",
			dataIndex: ["sale_price_list", "code"],
			width: "8%",
			// render: (item) => {
			// 	return <>{item && <span>{item.item + " - " + item.item_desc}</span>}</>;
			// },
		},
		{
			title: "Unit Discount",
			key: "discount",
			// dataIndex: ["discount"],
			width: "8%",
			// align: "right",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.discount}
						currencyId={currencyId}
						currencyOptions={currecies}
						maxDecimals={4}
						minDecimals={4}
					/>
					{record.sale_discount_matrix && (
						<div className="text-muted text-xsmall">
							Matrix Discount: {record.sale_discount_matrix?.description}
						</div>
					)}
				</>
			),
		},
		{
			title: "Unit Profit",
			key: "profit",
			// align: "right",
			width: "8%",
			dataIndex: ["profit"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
					maxDecimals={4}
					minDecimals={4}
				/>
			),
		},
		{
			title: "Total Price",
			key: "total_price",
			width: "8%",
			// align: "right",
			dataIndex: ["total_price"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
					maxDecimals={4}
					minDecimals={4}
				/>
			),
		},
		{
			title: "Total Discount",
			key: "total_discount",
			width: "8%",
			// align: "right",
			dataIndex: ["total_discount"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
					maxDecimals={4}
					minDecimals={4}
				/>
			),
		},
		{
			title: "Final Price",
			key: "total",
			width: "9%",
			// align: "right",
			dataIndex: ["total"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
					maxDecimals={4}
					minDecimals={4}
				/>
			),
		},
	];
};
export const processCols = (currencyId, currecies, companyCurrencyId) => {
	return [
		{
			title: "Item",
			key: "item",
			dataIndex: ["item"],
			width: "25%",
			render: (item) => {
				item && <span>{item.item + " - " + item.item_desc}</span>;
			},
		},
		{
			title: "Qty",
			key: "quantity",
			width: "7%",
			align: "right",
			render: (record) => (
				<span>
					{record.quantity} {record.item && <>{record.item.um}</>}
				</span>
			),
		},
		{
			title: "Unit Price",
			key: "price",
			// dataIndex: ["price"],
			align: "right",
			width: "10%",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.price}
						currencyId={currencyId}
						currencyOptions={currecies}
					/>
					{record.sale_price_list && (
						<div className="text-muted text-xsmall">
							Pricelist: {record.sale_price_list?.code}
						</div>
					)}
				</>
			),
		},
		{
			title: "Unit Discount",
			key: "discount",
			// dataIndex: ["discount"],
			align: "right",
			width: "10%",
			render: (record) => (
				<>
					<PriceDisplay
						price={record.discount}
						currencyId={currencyId}
						currencyOptions={currecies}
					/>
					{record.sale_discount_matrix && (
						<div className="text-muted text-xsmall">
							Matrix Discount: {record.sale_discount_matrix?.description}
						</div>
					)}
				</>
			),
		},
		{
			title: "Unit Profit",
			key: "profit",
			align: "right",
			width: "10%",
			dataIndex: ["profit"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Total Price",
			key: "total_price",
			width: "10%",
			align: "right",
			dataIndex: ["total_price"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Total Discount",
			key: "total_discount",
			width: "10%",
			align: "right",
			dataIndex: ["total_discount"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
		{
			title: "Final Price",
			key: "total",
			align: "right",
			width: "10%",
			dataIndex: ["total"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
	];
};

export const totalsGroupPriceCols = (currencyId, currecies, companyCurrencyId) => {
	return [
		{
			title: "",
			width: "35%",
			align: "right",
			render: () => (
				<span>
					<strong> Totals :</strong>
				</span>
			),
		},
		{
			title: "Total Price",
			key: "total_price",
			dataIndex: ["total_price"],
			width: "10%",
			align: "right",
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
			// colSpan:3
			// render: (record) => <span>{ record.item.item }</span>
		},
		{
			title: "",
			key: "total_discount",
			width: "10%",
			align: "right",
			dataIndex: ["total_discount"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
			// colSpan:3
			// render: (record) => <span>{ record.item.item }</span>
		},
		{
			title: "Unit cost",
			key: "total_profit",
			width: "10%",
			align: "right",
			dataIndex: ["total_profit"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={companyCurrencyId || currencyId}
					currencyOptions={currecies}
				/>
			),
			// colSpan:3
			// render: (record) => <span>{ record.item.item }</span>
		},
		{
			title: "",
			key: "total_total_price",
			width: "10%",
			align: "right",
			dataIndex: ["total_total_price"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
			// colSpan:3
			// render: (record) => <span>{ record.item.item }</span>
		},
		{
			title: "",
			key: "total_total_discount",
			width: "10%",
			align: "right",
			dataIndex: ["total_total_discount"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
			// colSpan:3
			// render: (record) => <span>{ record.item.item }</span>
		},
		{
			title: "Final Price",
			key: "final_price",
			width: "10%",
			align: "right",
			dataIndex: ["total_total"],
			render: (data) => (
				<PriceDisplay
					price={data}
					currencyId={currencyId}
					currencyOptions={currecies}
				/>
			),
		},
	];
};
