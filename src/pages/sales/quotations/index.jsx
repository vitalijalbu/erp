import { getAllSales } from "@/api/orders";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import {
	IconTransform,
	IconDots,
	IconEye,
	IconPencilMinus,
	IconPlus,
} from "@tabler/icons-react";
import { Button, Col, Row, Space, Tag, Dropdown } from "antd";
import Link from "next/link";
import { useState } from "react";
import _ from "lodash";
const Index = () => {
	const [reload, setReload] = useState(0);
	const [selected, setSelected] = useState(null);

	// Fetch API data
	const apiCall = async (filters) => {
		const result = await getAllSales(
			_.merge(filters, {
				columns: { sale_type: { search: { value: "quotation" } } },
			})
		);
		return result.data;
	};

	//Define the action dropdown items, the name of it has to stay items
	const items = [
		{
			key: 1,
			icon: <IconPencilMinus />,
			label: <Link href={`/sales/quotations/${selected?.id}/edit`}>Edit</Link>,
			disabled: selected?.editable == false,
		},
		{
			key: 2,
			icon: <IconTransform />,
			label: (
				<Link href={`/sales/quotations/${selected?.id}/conversion`}>
					Convert to order
				</Link>
			),
		},
	];

	// // Defins colors tags for different states
	// const stateColors = {
	//     closed: 'red',
	//     canceled: 'red',
	//     approved: 'green',
	//     inserted: 'blue'
	// };

	// Define table columns
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
		// {
		//     title: "State",
		//     key: "state",
		//     width: "10%",
		//     sorter: false,
		//     filterOptions: [
		// 		{ label: "Inserted", value: "inserted" },
		// 		{ label: "Approved", value: "approved" },
		// 		{ label: "Canceled", value: "canceled" },
		// 		{ label: "Closed", value: "closed" },
		// 	],
		//     render: ({ state }) => <Tag color={stateColors[state]}>{state}</Tag>,
		// },
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
			title: "Expires at",
			key: "expires_at",
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
						href={`/sales/quotations/${record.id}`}
					>
						<Button
							key='stock-limit-manager'
							icon={<IconEye />}
						>
							Show
						</Button>
					</Link>
					<Dropdown
						key={1}
						menu={{ items }}
						trigger={"click"}
						placement='bottomRight'
						arrow
					>
						<Button
							icon={<IconDots />}
							onClick={() => {
								setSelected(record);
							}}
						/>
					</Dropdown>
				</Space.Compact>
			),
		},
	];

	return (
		<div className='page'>
			<PageActions
				key={1}
				title='Sales quotations'
				extra={[
					<Link
						href='/sales/quotations/create'
						key='1'
					>
						<Button
							type='primary'
							icon={<IconPlus />}
						>
							Add new
						</Button>
					</Link>,
				]}
			/>

			<div className='page-content'>
				<Row>
					<Col
						span={24}
						className='mb-3'
					>
						<Datatable
							columns={tableColumns}
							fetchData={apiCall}
							rowKey={(record) => record.id}
							watchStates={[reload]}
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
};

export default Index;
