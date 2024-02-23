import React from "react";
import { Table } from "antd";
/* import { numberFormatter } from "@/hooks/formatter";
import Link from "next/link"; */

const RoutingDetailsTable = (props) => {
	const routing = props.routing || [];
	const columns = [
		{
			title: "Operation",
			key: "operation_id",
			dataIndex: "process",
			render: (e) => (
				<span>
					{e?.code} - {e?.name}
				</span>
			),
		},

		{
			title: "Price Item",
			key: "price_item",
			align: "right",
			dataIndex: "price_item",
			render: (e) => `${e?.item || ""} - ${e?.item_desc || ""}`,
		},
		{
			title: "Qty",
			key: "quantity",
			dataIndex: "quantity",
			render: (e) => e,
		},
		{
			title: "Setup Price Item",
			key: "setup_price_item_id",
			dataIndex: "setup_price_item_id",
			render: (e) => {
				return `${e?.item_id || ""} - ${e?.item_desc || ""}`;
			},
		},
		{
			title: "Operator Cost Item",
			key: "operator_cost_item",
			dataIndex: "operator_cost_item",
			render: (e) => {
				return `${e?.item} - ${e?.item_desc}`;
			},
		},
		{
			title: "Execution Time (min)",
			key: "execution_time",
			dataIndex: "execution_time",
			render: (e) => e,
		},
		{
			title: "Setup Time (min)",
			key: "setup_time",
			dataIndex: "setup_time",
			render: (e) => e,
		},
		{
			title: "Operation Men Occupation",
			key: "operation_men_occupation",
			dataIndex: "operation_men_occupation",
			render: (e) => e,
		},
		{
			title: "Machine Men Occupation",
			key: "machine_men_occupation",
			dataIndex: "machine_men_occupation",
			render: (e) => e || "null",
		},
	];

	return (
		<Table
			columns={columns}
			pagination={false}
			dataSource={routing}
		></Table>
	);
};

export default RoutingDetailsTable;
