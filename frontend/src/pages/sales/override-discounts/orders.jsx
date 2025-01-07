import React, { useState } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllDiscountOverride } from "@/api/sales/discount";
import PageActions from "@/shared/components/page-actions";
import { Space, Row, Col, Button, Tag } from "antd";
import { IconEye } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import _ from "lodash";
import Toolbar from "@/shared/sales/override-discounts/toolbar";

const Index = () => {
	//Set page permissions
	if (!UserPermissions.authorizePage("sales_override_discount.manage")) {
		return false;
	}
	const [reload, setReload] = useState(0);
	const [popup, setPopup] = useState(false);
	const [selected, setSelected] = useState(null);
	const [loadingAction, setLoadingAction] = useState(null);

	const stateColors = {
		closed: "red",
		canceled: "red",
		approved: "green",
		inserted: "blue",
	};

	const handleTableChange = async (params) => {
		const result = await getAllDiscountOverride(
			_.merge(params, {
				columns: { sale_type: { search: { value: "sale" } } },
			})
		);

		return result.data;
	};

	const tableColumns = [
		{
			title: "Code",
			key: "code",
			width: "10%",
			render: ({ code }) => <Tag>{code}</Tag>,
		},
		{
			title: "BP description",
			key: "bp_desc",
			sorter: false,
		},
		{
			title: "BP id",
			key: "bp_id",
			dataIndex: "bp_id",
		},
		{
			title: "State",
			key: "state",
			width: "10%",
			sorter: false,
			filterOptions: [
				{ label: "Inserted", value: "inserted" },
				{ label: "Approved", value: "approved" },
				{ label: "Canceled", value: "canceled" },
				{ label: "Closed", value: "closed" },
			],
			render: ({ state }) => <Tag color={stateColors[state]}>{state}</Tag>,
		},
		{
			title: "Customer order ref.",
			key: "customer_order_ref",
			sorter: false,
		},
		{
			title: "Created at",
			key: "created_at",
			type: "date",
		},
		{
			title: "Sale Internal contact",
			key: "sale_internal_contact",
			sorter: false,
		},
		{
			title: "Delivery date",
			key: "delivery_date",
			type: "date",
		},

		{
			title: "Actions",
			key: "actions",
			align: "right",
			className: "table-actions",
			render: (record) => (
				<Space.Compact>
					<Link
						key={0}
						href={`/sales/orders/${record.id}/edit`}
					>
						<Button
							key={"show_" + record.id}
							icon={<IconEye />}
						>
							Show
						</Button>
					</Link>
					{/* 	<Link
						key={1}
						href={`/sales/orders/${record.id}/edit`}
					>
						<Button
							disabled={record.state !== "inserted"}
							key={"edit_" + record.id}
							icon={<IconPencilMinus />}
						>
							Edit
						</Button>
					</Link> */}
				</Space.Compact>
			),
		},
	];

	return (
		<>
			{popup && (
				<ModalClone
					opened={popup}
					id={selected}
					toggle={() => setPopup(!popup)}
					reload={() => setReload(reload + 1)}
				/>
			)}
			<div className='page'>
				<PageActions title='Override Sales Discount Orders'>
					<Toolbar />
				</PageActions>

				<div className='page-content'>
					<Row>
						<Col
							span={24}
							className='mb-3'
						>
							<Datatable
								fetchData={handleTableChange}
								columns={tableColumns}
								rowKey={(record) => record.id}
								watchStates={[reload]}
							/>
						</Col>
					</Row>
				</div>
			</div>
		</>
	);
};

export default Index;
