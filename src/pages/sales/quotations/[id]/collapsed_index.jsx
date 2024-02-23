import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import {
	Card,
	Button,
	Col,
	Divider,
	Row,
	Typography,
	List,
	Flex,
	Table,
	Tag,
	Space,
	Tooltip,
	Collapse,
} from "antd";
const { Text } = Typography;
import LastActivity from "@/shared/users/last-activity";
import { IconPencilMinus, IconTransform } from "@tabler/icons-react";
import PageActions from "@/shared/components/page-actions";
import { getSaleById } from "@/api/orders";
import Link from "next/link";
import { dateFormatter, parseBoolColors, parseYesNo } from "@/hooks/formatter";

function wrapText(text, length = 40, textTooltip = false) {
	const textValid = Array.isArray(text) ? text?.join(" ") : text;

	const textReduce =
		textValid?.length > length
			? textValid.substring(0, length) + "..."
			: textValid;
	if (textTooltip && textValid?.length > length)
		return (
			<Tooltip title={textValid}>
				<Text>{textReduce}</Text>
			</Tooltip>
		);
	else return <Text>{textReduce}</Text>;
}

const Index = (props) => {
	const router = useRouter();
	const { id } = router.query;

	const [loading, setLoading] = useState(false);
	const [data, setData] = useState({});

	function checkExist(obj, key) {
		const keys = Object.keys(obj);
		const keysFound = keys.filter((el) => el.includes(key));
		const existKeys = keysFound?.filter((el) => !!obj[el]);
		return existKeys?.length > 0;
	}

	function Contacts({ dataProp }) {
		console.log(dataProp);
		return (
			<List>
				<List.Item key={0}>
					<List.Item.Meta title='Name' />
					<div>
						<Text>{dataProp?.name}</Text>
					</div>
				</List.Item>
				<List.Item key={0}>
					<List.Item.Meta title='Mobile Phone' />
					<div>
						<Text>{dataProp?.mobile_phone}</Text>
					</div>
				</List.Item>{" "}
				<List.Item key={0}>
					<List.Item.Meta title='Office Phone' />
					<div>
						<Text>{dataProp?.office_phone}</Text>
					</div>
				</List.Item>
				<List.Item key={0}>
					<List.Item.Meta title='Email' />
					<div>
						<Text>{dataProp?.email}</Text>
					</div>
				</List.Item>
				<List.Item key={0}>
					<List.Item.Meta title='Department' />
					<div>
						<Text>{dataProp?.department}</Text>
					</div>
				</List.Item>
				<List.Item key={0}>
					<List.Item.Meta title='Type Contact' />
					<div>
						<Text>{dataProp?.type}</Text>
					</div>
				</List.Item>
				<List.Item key={0}>
					<List.Item.Meta title='Is Employee' />
					<div>
						<Tag color={parseBoolColors(dataProp?.is_employee)}>
							{parseYesNo(dataProp?.is_employee)}
						</Tag>
					</div>
				</List.Item>
			</List>
		);
	}

	const items = [
		{
			key: "1",
			label: "Internal Contact",
			children: <Contacts dataProp={data?.internal_contact} />,
		},
		{
			key: "2",
			label: "External Contact",
			children: <Contacts dataProp={data?.external_contact} />,
		},
		{
			key: "3",
			label: "Other references",
			children: (
				<List>
					<List.Item key={0}>
						<List.Item.Meta title='Customer ref' />
						<div>
							<Text>{data?.customer_order_ref}</Text>
						</div>
					</List.Item>
					<List.Item key={0}>
						<List.Item.Meta title='Ref. A' />
						<div>
							<Text>{data?.order_ref_a}</Text>
						</div>
					</List.Item>
					<List.Item key={0}>
						<List.Item.Meta title='Ref. B' />
						<div>
							<Text>{data?.order_ref_b}</Text>
						</div>
					</List.Item>
					<List.Item key={0}>
						<List.Item.Meta title='Ref. C' />
						<div>
							<Text>{data?.order_ref_c}</Text>
						</div>
					</List.Item>
				</List>
			),
		},
	];

	function returnTextToolTip(object) {
		return (
			<div>
				<Flex>
					<Text strong>Name: </Text>
					<Text>{object?.name}</Text>
				</Flex>

				<Flex>
					<Text strong>Deparment: </Text>
					<Text>{object?.department}</Text>
				</Flex>

				<Flex>
					<Text strong>Mobile phone: </Text>
					<Text>{object?.mobile_phone}</Text>
				</Flex>

				<Flex>
					<Text strong>Office phone: </Text>
					<Text>{object?.office_phone}</Text>
				</Flex>

				<Flex>
					<Text strong>Email: </Text>
					<Text>{object?.email}</Text>
				</Flex>

				<Flex>
					<Text strong>Language: </Text>
					<Text>{object?.language}</Text>
				</Flex>

				<Flex>
					<Text strong>Type: </Text>
					<Text>{object?.type}</Text>
				</Flex>

				<Flex>
					<Text strong>Is Employee: </Text>
					<Text>{parseYesNo(object?.is_employee)}</Text>
				</Flex>

				<Flex>
					<Text strong>Note: </Text>
					<Text>{object?.note}</Text>
				</Flex>
			</div>
		);
	}

	// Get BP details
	useEffect(() => {
		if (router.isReady) {
			setLoading(true);

			// Get ID BP and set data state
			if (id) {
				(async () => {
					const { data, error } = await getSaleById(id);
					if (!error) {
						// Set state contacts required here
						setData(data);
						// Set form values
					}
					setLoading(false);
				})();
			}
		}
	}, [router.isReady, id]);

	return (
		<div className='page'>
			<PageActions
				backUrl='/sales/quotations'
				title={
					<>
						View quotation - <mark>{data?.code}</mark>
					</>
				}
				// extra={<LastActivity data={null} />}
				loading={loading}
				extra={[
					<Space>
						<Link
							key={0}
							href={`/sales/quotations/${data?.id}/edit`}
							target='_blank'
						>
							<Button icon={<IconPencilMinus />}>Edit</Button>
						</Link>
						<Link href={`/sales/orders/${id}/conversion`}>
							<Button
								loading={loading}
								icon={<IconTransform />}
							>
								Convert to order
							</Button>
						</Link>
					</Space>,
				]}
			/>
			<div className='page-content'>
				<Row gutter={16}>
					<Col
						xs={24}
						sm={24}
						lg={16}
					>
						<Card
							title='Main details'
							className='mb-3'
							key={0}
							loading={loading}
						>
							<Row gutter={16}>
								<Col
									xs={24}
									sm={24}
									lg={12}
								>
									<List>
										<List.Item key={0}>
											<List.Item.Meta title='Business partner' />
											<Link href={`/business-partners/${data?.bp?.IDbp}`}>
												{data?.bp?.desc}
											</Link>
										</List.Item>
										<List.Item key={0}>
											<List.Item.Meta title='Quotation created' />
											<div>
												<Tag>{dateFormatter(data?.created_at)}</Tag>
											</div>
										</List.Item>

										<List.Item key={0}>
											<List.Item.Meta title='Carrier' />
											<div>
												<Tag>{data?.carrier?.desc}</Tag>
											</div>
										</List.Item>
										<List.Item key={0}>
											<List.Item.Meta title='State' />
											<div>
												<Tag>{data?.state}</Tag>
											</div>
										</List.Item>
									</List>
								</Col>
								<Col span={12}>
									<List>
										<List.Item key={0}>
											<List.Item.Meta title='Sale type' />
											<div>
												<Tag>{data?.sale_type}</Tag>
											</div>
										</List.Item>
										<List.Item key={0}>
											<List.Item.Meta title='Expiration Date' />
											<div>
												{data?.expires_at && (
													<Tag>{dateFormatter(data?.expires_at)}</Tag>
												)}
											</div>
										</List.Item>

										<List.Item key={0}>
											<List.Item.Meta title='Currency' />
											<div>
												<Text>
													{data?.currency?.id} - {data?.currency?.name}
												</Text>
											</div>
										</List.Item>

										<List.Item key={0}>
											<List.Item.Meta title='Order Type' />
											<div>
												<Tag>{data?.order_type?.label}</Tag>
											</div>
										</List.Item>
									</List>
								</Col>
							</Row>

							<Row gutter={16}>
								<Col
									span={24}
									className='mt-2'
								>
									<Divider
										orientation='left'
										orientationMargin={0}
									>
										Contacts
									</Divider>

									<Collapse
										style={{ marginLeft: -20 }}
										items={items}
										defaultActiveKey={["-1"]}
										bordered={false}
										ghost
									/>
								</Col>
							</Row>

							<Divider
								orientation='left'
								orientationMargin={0}
							>
								Delivery
							</Divider>
							<List
								style={{
									display: "flex",
									flexDirection: "column",
									width: "100%",
								}}
							>
								<Row gutter={16}>
									<Col
										xs={24}
										sm={24}
										lg={8}
									>
										<List.Item
											key={0}
											style={{ width: "100%" }}
										>
											<List.Item.Meta title='Delivery date' />
											<div>
												<Text>{dateFormatter(data?.delivery_date)}</Text>
											</div>
										</List.Item>
									</Col>
									<Col
										xs={24}
										sm={24}
										lg={8}
									>
										<List.Item
											key={0}
											style={{ width: "100%" }}
										>
											<List.Item.Meta title='Term' />
											<div>
												<Text>{data?.delivery_term?.label}</Text>
											</div>
										</List.Item>
									</Col>
									<Col
										xs={24}
										sm={24}
										lg={8}
									>
										<List.Item
											key={0}
											style={{ width: "100%" }}
										>
											<List.Item.Meta title='Address' />
											{wrapText(data?.delivery_address?.full_address, 40, true)}
										</List.Item>
									</Col>
								</Row>
							</List>
						</Card>
					</Col>
					<Col
						xs={24}
						sm={24}
						lg={8}
					>
						<Card
							title='Invoice / Payment'
							className='mb-3'
							key={0}
							loading={loading}
						>
							<List>
								<List.Item key={0}>
									<List.Item.Meta title='Invoice Name' />
									<div>
										<Text>{data?.invoice_address?.name}</Text>
									</div>
								</List.Item>

								<List.Item key={0}>
									<List.Item.Meta title='Invoice Adreess' />
									<div>
										{wrapText(data?.invoice_address?.full_address, 40, true)}
									</div>
								</List.Item>
								<List.Item key={0}>
									<List.Item.Meta title='Payment Method' />
									<div>
										<Text>{data?.payment_method?.label}</Text>
									</div>
								</List.Item>
								<List.Item key={0}>
									<List.Item.Meta title='Payment Term' />
									<div>
										<Text>{data?.payment_term?.label}</Text>
									</div>
								</List.Item>
							</List>
						</Card>
						<Card
							title='Calculated pricing'
							key={2}
							loading={loading}
						>
							<List>
								<List.Item key={0}>
									<List.Item.Meta title='Subtotal price' />
									<div>
										<Text>0.00</Text>
									</div>
								</List.Item>
								<List.Item key={0}>
									<List.Item.Meta title='Discounts' />
									<div>
										<Text>0.00</Text>
									</div>
								</List.Item>
								<List.Item key={0}>
									<List.Item.Meta title='Total price' />
									<div>
										<Text>0.00</Text>
									</div>
								</List.Item>
							</List>
						</Card>
					</Col>
				</Row>
				{/* Row Items */}
				<Row>
					<Col span={24}>
						<TableRows
							rows={data?.sale_rows}
							loading={loading}
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
};
export default Index;

//=============================================================================
// Component Addon
//=============================================================================

const TableRows = (props) => {
	// Manually define table columns
	const tableColumns = [
		{
			title: "Position",
			dataIndex: "position",
			width: 240,
			key: "position",
		},
		{
			title: "Item",
			dataIndex: "item_id",
			key: "item_id",
			width: 240,
		},
		{
			title: "Weight",
			dataIndex: "weight",
			key: "weight",
		},
		{
			title: "Created at",
			width: 240,
			key: "created_at",
			render: ({ created_at }) => dateFormatter(created_at),
		},
		{
			title: "Product",
			dataIndex: "standard_product_id",
			width: 240,
			key: "standard_product_id",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Configuration",
			dataIndex: "configuration",
			width: 240,
			key: "configuration",
			render: (text) => wrapText(text, 40, true),
		},
		{
			title: "Qty",
			width: "4%",
			dataIndex: "quantity",
			width: 240,
			key: "quantity",
		},
		{
			title: "Order Type",
			dataIndex: "order_type_id",
			width: 240,
			key: "order_type_id",
		},
		{
			title: "Destination Address",
			dataIndex: "destination_address_id",
			width: 240,
			key: "destination_address_id",
			render: (text) => wrapText(text, 40, true),
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
			dataIndex: "carrier_id",
			width: 240,
			key: "carrier_id",
		},
		{
			title: "Tax Code",
			dataIndex: "tax_code",
			width: 240,
			key: "tax_code",
		},
		{
			title: "Lot ID",
			dataIndex: "lot_id",
			width: 240,
			key: "lot_id",
		},
		{
			title: "Delivery date",
			key: "delivery_date",
			width: 240,
			render: ({ delivery_date }) => dateFormatter(delivery_date),
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
	];

	return (
		<Card
			title='Row items'
			key={1}
			loading={props?.loading}
		>
			<Table
				dataSource={props?.rows}
				columns={tableColumns}
				tableLayout='fixed'
				scrollToFirstRowOnChange={true}
				scroll={{ x: "max-content" }}
				pagination={false} // Disable pagination for simplicity
			/>
		</Card>
	);
};
