import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import _ from "lodash";
import { useOpenInBrowser } from "@/hooks/download";
import {
	Card,
	Button,
	Col,
	Divider,
	Row,
	Typography,
	Flex,
	List,
	Table,
	Tooltip,
	Space,
	Modal,
	message
} from "antd";
const { Text } = Typography;
const { confirm } = Modal;
import {
	IconAlertCircle,
	IconCheck,
	IconHelpCircle,
	IconPencilMinus,
	IconPrinter,
	IconSend,
	IconX,
} from "@tabler/icons-react";
import PageActions from "@/shared/components/page-actions";
import {
	getSaleById,
	printSale,
	sendMailSale,
	updateOrderStats,
	updateRowState,
} from "@/api/orders";
import { dateFormatter, parseYesNo } from "@/hooks/formatter";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import SalesMailModal from "@/shared/sales/sales-mail-modal";
import { getAllCurrencies } from "@/api/bp";
import PriceDisplay from "@/shared/components/price-display";
import RowPriceDetailsModal from "@/shared/sales/quotations/row-price-details-modal";
import { useColumnShow } from "@/hooks/useColumnShowOrder";
import LastActivity from "@/shared/users/last-activity";

function wrapText(text, length = 40, textTooltip = false, props) {
	const textValid = Array.isArray(text) ? text?.join(" ") : text;

	return textValid?.length > length ? (
		<Tooltip title={textValid}>
			<Text
				ellipsis={true}
				{...props}
				className='text-wrap-250'
			>
				{textValid}
			</Text>
		</Tooltip>
	) : (
		<Text
			ellipsis={true}
			{...props}
			className='text-wrap-250'
		>
			{textValid}
		</Text>
	);
}

const Index = (props) => {
	const router = useRouter();
	const { id } = router.query;
	const [reloadIndex, setReloadIndex] = useState(0);
	const [columns, setColumns] = useState([]);
	const [showModalPrice, setShowModalPrice] = useState(false);
	const [modalPriceRow, setModalPriceRow] = useState(null);
	const toggleModalPrice = (row = null) => {
		setShowModalPrice(!showModalPrice);
		setModalPriceRow(row);
	};
	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(null);
	const [reload, setReload] = useState(0);
	const [data, setData] = useState({});
	const [mailModal, setMailModal] = useState(false);
	const [allCurrencies, setAllCurrencies] = useState([]);
	const [calculatedPrices, setCalculatedPrices] = useState({
		total_costs: 0,
		total_discount_override: 0,
		total_discount: 0,
		total_final_price: 0,
		total_profit: 0,
		total_price: 0,
	});

	useEffect(() => {
		getAllCurrencies()
			.then(({ data }) => {
				setAllCurrencies(data);
			})
			.catch((error) => {
				console.log("cant fetch currencies");
			});
		setCalculatedPrices({
			total_costs: _.sum(_.map(data.sale_rows, "total_cost")),
			total_discount_override: _.sum(
				_.map(data.sale_rows, "override_total_discount")
			),
			total_discount: _.sum(_.map(data.sale_rows, "total_discount")),
			total_final_price: _.sum(_.map(data.sale_rows, "total_final_price")),
			total_profit: _.sum(_.map(data.sale_rows, "total_profit")),
			total_price: _.sum(_.map(data.sale_rows, "total_price")),
		});
	}, [data]);

	useEffect(() => {
		const col = useColumnShow(
			toggleModalPrice,
			wrapText,
			data?.currency_id,
			data?.company_currency_id,
			allCurrencies,
			setReload,
			id,
			setLoading,
			data,
			reload
		);
		setColumns(col);
	}, [allCurrencies]);

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
					} else {
						router.push("/sales/orders");
						message.error("404 - Record Not Found");
					}
					setLoading(false);
				})();
			}
		}
	}, [router.isReady, id, reload]);

	function checkExist(obj, key) {
		const keys = Object.keys(obj);
		const keysFound = keys.filter((el) => el.includes(key));
		// check if keysFound of the object is empty or not
		const existKeys = keysFound?.filter((el) => !!obj[el]);
		if (existKeys?.length > 0) {
			return true;
		}
		return false;
	}

	// Print sale API
	const handlePrint = async () => {
		setLoadingAction("print");
		const { dataResponse, error } = await printSale(id);
		if (!error) {
			useOpenInBrowser(dataResponse, `order_${data?.code}.pdf`);
		} else {
			message.error("Error during label pdf generation");
		}
		setLoadingAction(null);
	};
	const TableRows = ({ data, rows, loading, reload, currencies }) => {
		// Defins colors tags for different states

		return (
			<Card
				title='Row items'
				key={1}
				loading={loading}
			>
				{showModalPrice && (
					<RowPriceDetailsModal
						detailObj={modalPriceRow}
						onToggle={(val) => setShowModalPrice(val)}
						open={showModalPrice}
						currencies={currencies}
						currencyId={data.currency_id}
						companyCurrencyId={data.company_currency_id}
					/>
				)}
				<Table
					dataSource={_.sortBy(rows, (o) => parseInt(o.position))}
					dataOriginal={data}
					columns={columns}
					tableLayout='fixed'
					scrollToFirstRowOnChange={true}
					rowKey={"id"}
					scroll={{ x: "max-content" }}
					pagination={false} // Disable pagination for simplicity
				/>
			</Card>
		);
	};

	const actionstate = async (state) => {
		confirm({
			title: (
				<>
					Confirm order state - <mark>{state}</mark> ?
				</>
			),
			icon: (
				<IconAlertCircle
					color={"#faad14"}
					size='22'
					className='anticon'
				/>
			),
			transitionName: "ant-modal-slide-up",
			content: `Do you want to change the order state to ${state} ?`,
			okText: "Continue",
			cancelText: "Cancel",
			async onOk() {
				setLoading(id);
				const { data, error, validationErrors } = await updateOrderStats(id, {
					state,
				});
				if (error || validationErrors) {
					message.error(error.response.data.message);
				} else {
					message.success(`Order successfully changed to state ${state}`);
					// Reload all
					setReload(reload + 1);
				}
				setLoading(null);
			},
		});
	};

	return (
		<div className='page'>
			<SalesMailModal
				id={data.id}
				bpId={data.bp_id}
				type={"order"}
				from={data.internal_contact?.email}
				cc={[data.internal_contact?.email, data.external_contact?.email]}
				open={mailModal}
				key={data.id}
				onClose={() => setMailModal(false)}
			/>
			<PageActions
				backUrl='/sales/orders'
				title={
					<>
						View order - <mark>{data?.code}</mark>
					</>
				}
				// extra={<LastActivity data={null} />}
				loading={loading}
				extra={[
					<Space>
						{data?.available_state_transitions?.includes("approved") &&
							UserPermissions.authorizePage("sales.approved") && (
								<Button
									icon={<IconCheck color='#33855c' />}
									onClick={() => actionstate("approved")}
									key={"approve"}
								>
									Approve order
								</Button>
							)}
						{data?.available_state_transitions?.includes("canceled") &&
							UserPermissions.authorizePage("sales.canceled") && (
								<Button
									key={"cancel"}
									loading={loading}
									icon={<IconX color='#e20004' />}
									onClick={() => actionstate("canceled")}
								>
									Cancel order
								</Button>
							)}
						{/*data?.available_state_transitions?.includes('closed') && (
                <Button key={1} loading={loading} icon={<IconX color="#e20004"/>}>
                  Close order
                </Button>
              )*/}
						{data.state === "inserted" && (
							<Link
								key={2}
								href={`/sales/orders/${data?.id}/edit`}
							>
								<Button
									icon={<IconPencilMinus />}
									key={"edit"}
								>
									Edit
								</Button>
							</Link>
						)}
						<Button
							key={"print"}
							icon={<IconPrinter />}
							onClick={() => handlePrint()}
							loading={loadingAction === "print"}
						>
							Print
						</Button>
						<Button
							key={"mail"}
							icon={<IconSend />}
							onClick={() => setMailModal(true)}
							loading={loadingAction === "mail"}
						>
							Send Email
						</Button>
					</Space>,
				]}
			/>
			<div className='page-content'>
				<Row
					gutter={16}
					className='mb-3'
				>
					<Col
						xs={24}
						sm={24}
						lg={16}
					>
						<Card
							title='Main details'
							key={0}
							loading={loading}
							extra={
                                <LastActivity
                                    data={{ last_modification: data?.last_modification || {}, creation: data?.creation || {} }}
                                    title={`Order ${data?.code}`}
                                />
                            }
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
												<Text>{dateFormatter(data?.created_at)}</Text>
											</div>
										</List.Item>

										<List.Item key={0}>
											<List.Item.Meta title='Carrier' />
											<div>
												<Text>{data?.carrier?.desc}</Text>
											</div>
										</List.Item>
										<List.Item key={0}>
											<List.Item.Meta title='State' />
											<div>
												<Text>{data?.state}</Text>
											</div>
										</List.Item>
									</List>
								</Col>
								<Col span={12}>
									<List>
										<List.Item key={0}>
											<List.Item.Meta title='Sale type' />
											<div>
												<Text>{data?.sale_type}</Text>
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
												<Text>{data?.order_type?.label}</Text>
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
									{checkExist(data, "ref") && (
										<>
											<Divider
												orientation='left'
												orientationMargin={0}
												className='mt-2'
											>
												References
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
														lg={12}
													>
														{data?.customer_order_ref && (
															<List.Item key={0}>
																<List.Item.Meta title='Customer ref' />
																<div>
																	<Text>{data?.customer_order_ref}</Text>
																</div>
															</List.Item>
														)}
													</Col>
													<Col
														xs={24}
														sm={24}
														lg={12}
													>
														{data?.order_ref_a && (
															<List.Item key={0}>
																<List.Item.Meta title='Ref. A' />
																<div>
																	<Text>{data?.order_ref_a}</Text>
																</div>
															</List.Item>
														)}
													</Col>
													<Col
														xs={24}
														sm={24}
														lg={12}
													>
														{data?.order_ref_b && (
															<List.Item key={0}>
																<List.Item.Meta title='Ref. B' />
																<div>
																	<Text>{data?.order_ref_b}</Text>
																</div>
															</List.Item>
														)}
													</Col>
													<Col
														xs={24}
														sm={24}
														lg={12}
													>
														{data?.order_ref_c && (
															<List.Item key={0}>
																<List.Item.Meta title='Ref. C' />
																<div>
																	<Text>{data?.order_ref_c}</Text>
																</div>
															</List.Item>
														)}
													</Col>
												</Row>
											</List>
										</>
									)}

									<Row gutter={16}>
										<Col
											span={24}
											className='mt-2'
										>
											<Divider
												orientation='left'
												orientationMargin={0}
											>
												<Flex align='center'>
													<span>Internal Sales Representative</span>
													<Tooltip
														title={() =>
															returnTextToolTip(data?.internal_contact)
														}
														align={"left"}
														placement='right'
														color='#fff'
													>
														<IconHelpCircle
															style={{ margin: "0 10px" }}
															color='#5D9AF0'
														/>
													</Tooltip>
												</Flex>
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
															<List.Item.Meta title='Name' />
															<div>
																<Text>{data?.internal_contact?.name}</Text>
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
															<List.Item.Meta title='Mobile Phone' />
															<div>
																<Text>
																	{data?.internal_contact?.mobile_phone}
																</Text>
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
															<List.Item.Meta title='Email' />
															<div>
																<Text>{data?.internal_contact?.email}</Text>
															</div>
														</List.Item>
													</Col>
												</Row>
											</List>
										</Col>
										<Col
											span={24}
											className='mt-2'
										>
											<Divider
												orientation='left'
												orientationMargin={0}
											>
												<Flex align='center'>
													<span>External Sales Representative</span>
													<Tooltip
														title={() =>
															returnTextToolTip(data?.external_contact)
														}
														align={"left"}
														placement='right'
														color='#fff'
													>
														<IconHelpCircle
															style={{ margin: "0 10px" }}
															color='#5D9AF0'
														/>
													</Tooltip>
												</Flex>
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
															<List.Item.Meta title='Name' />
															<div>
																<Text>{data?.external_contact?.name}</Text>
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
															<List.Item.Meta title='Mobile Phone' />
															<div>
																<Text>
																	{data?.external_contact?.mobile_phone}
																</Text>
															</div>
														</List.Item>
													</Col>
													<Col
														xs={24}
														sm={24}
														lg={8}
													>
														{" "}
														<List.Item
															key={0}
															style={{ width: "100%" }}
														>
															<List.Item.Meta title='Email' />
															<div>
																<Text>{data?.external_contact?.email}</Text>
															</div>
														</List.Item>
													</Col>
												</Row>
											</List>
										</Col>
									</Row>
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
								<List.Item key={"total-costs"}>
									<List.Item.Meta title='Total Costs' />
									<div>
										<PriceDisplay
											currencyId={data.company_currency_id || data.currency_id}
											currencyOptions={allCurrencies}
											price={calculatedPrices.total_costs}
										/>
									</div>
								</List.Item>
								<List.Item key={"total-discount"}>
									<List.Item.Meta title='Total Discount' />
									<div>
										<PriceDisplay
											currencyId={data.currency_id}
											currencyOptions={allCurrencies}
											price={calculatedPrices.total_discount}
										/>
									</div>
								</List.Item>
								<List.Item key={"total-price"}>
									<List.Item.Meta title='Total price' />
									<div>
										<PriceDisplay
											currencyId={data.currency_id}
											currencyOptions={allCurrencies}
											price={calculatedPrices.total_price}
										/>
									</div>
								</List.Item>
								<List.Item key={"total-final-price"}>
									<List.Item.Meta title='Total Final price' />
									<div>
										<PriceDisplay
											currencyId={data.currency_id}
											currencyOptions={allCurrencies}
											price={calculatedPrices.total_final_price}
										/>
									</div>
								</List.Item>
								<List.Item key={"total-profit"}>
									<List.Item.Meta title='Total Profit' />
									<div>
										<PriceDisplay
											currencyId={data.company_currency_id || data.currency_id}
											currencyOptions={allCurrencies}
											price={calculatedPrices.total_profit}
										/>
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
							data={data}
							loading={loading}
							reload={() => setReload(reload + 1)}
							currencies={allCurrencies}
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
