import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import _ from "lodash";
import { useOpenInBrowser } from "@/hooks/download";
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
	Space,
	Tooltip,
	Popover,
	message,
	Modal,
} from "antd";
const { Text } = Typography;
const { confirm } = Modal;
import LastActivity from "@/shared/users/last-activity";
import {
	IconHelpCircle,
	IconPencilMinus,
	IconPrinter,
	IconSend,
	IconTransform,
} from "@tabler/icons-react";
import PageActions from "@/shared/components/page-actions";
import { getSaleById, printSale, sendMailSale } from "@/api/orders";
import { dateFormatter, parseYesNo } from "@/hooks/formatter";
import ConfigurationDetailsTable from "@/shared/items/configuration-details-table";
import UserPermissions from "@/policy/ability";
import { IconCheck, IconBan } from "@tabler/icons-react";
import { getAllCurrencies } from "@/api/bp";
import { getMailTemplate } from "@/api/sales/quotations";
import SalesMailModal from "@/shared/sales/sales-mail-modal";
import PriceDisplay from "@/shared/components/price-display";
import { IconReceiptDollar } from "@tabler/icons-react";
import RowPriceDetailsModal from "@/shared/sales/quotations/row-price-details-modal";
import { createOverrideDiscount } from "@/api/sales/discount";
import { useColumnShow } from "@/hooks/useColumnShowQuotations";
const Index = (props) => {
	const router = useRouter();
	const { id } = router.query;

	const [reload, setReload] = useState(0);
	const [loading, setLoading] = useState(false);
	const [loadingAction, setLoadingAction] = useState(null);
	const [data, setData] = useState({});
	const [mailModal, setMailModal] = useState(false);
	const [allCurrencies, setAllCurrencies] = useState([]);
	const [columns, setColumns] = useState([]);
	const [reloadIndex, setReloadIndex] = useState(0);
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
	function checkExist(obj, key) {
		const keys = Object.keys(obj);
		const keysFound = keys.filter((el) => el.includes(key));
		const existKeys = keysFound?.filter((el) => !!obj[el]);
		return existKeys?.length > 0;
	}

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
	}, [router.isReady, id, reload, reloadIndex]);

	useEffect(() => {
		const col = useColumnShow(
			toggleModalPrice,
			wrapText,
			data?.currency_id,
			data?.company_currency_id,
			allCurrencies,
			setReloadIndex,
			id,
			setLoading
		);
		setColumns(col);
	}, [allCurrencies]);

	// Print sale API
	const handlePrint = async () => {
		setLoadingAction("print");
		const { dataResponse, error } = await printSale(id);
		if (!error) {
			useOpenInBrowser(dataResponse, `quotation_${data?.code}.pdf`);
		} else {
			message.error("Error during label pdf generation");
		}
		setLoadingAction(null);
	};

	const [showModalPrice, setShowModalPrice] = useState(false);
	const [modalPriceRow, setModalPriceRow] = useState(null);
	const toggleModalPrice = (row = null) => {
		setShowModalPrice(!showModalPrice);
		setModalPriceRow(row);
	};

	const TableRows = (props, { data }) => {
		return (
			<Card
				title='Row items'
				key={"row-items"}
				loading={props?.loading}
			>
				{showModalPrice && (
					<RowPriceDetailsModal
						detailObj={modalPriceRow}
						onToggle={(val) => setShowModalPrice(val)}
						open={showModalPrice}
						currencies={props.currencies}
						currencyId={props.data.currency_id}
						companyCurrencyId={props.data.company_currency_id}
					/>
				)}
				<Table
					dataSource={_.sortBy(props?.rows, (o) => parseInt(o.position))}
					dataOriginal={props?.data}
					columns={columns || []}
					tableLayout='fixed'
					scrollToFirstRowOnChange={true}
					scroll={{ x: "max-content" }}
					rowKey={"id"}
					pagination={false} // Disable pagination for simplicity
				/>
			</Card>
		);
	};

	return (
		<div className='page'>
			{mailModal && (
				<SalesMailModal
					id={data.id}
					bpId={data.bp_id}
					type={"quotation"}
					from={data.internal_contact?.email}
					cc={[data.internal_contact?.email, data.external_contact?.email]}
					open={mailModal}
					key={data.id}
					onClose={() => setMailModal(false)}
				/>
			)}
			<PageActions
				backUrl='/sales/quotations'
				title={
					<>
						View quotation - <mark>{data?.code}</mark>
					</>
				}
				loading={loading}
				extra={[
					<Space key={0}>
						<Link
							key={1}
							href={`/sales/quotations/${data?.id}/edit`}
						>
							<Button
								icon={<IconPencilMinus />}
								key={"edit"}
							>
								Edit
							</Button>
						</Link>
						<Link
							key={2}
							href={`/sales/quotations/${id}/conversion`}
						>
							<Button
								loading={loading}
								icon={<IconTransform />}
								key={"conversion"}
							>
								Convert to order
							</Button>
						</Link>
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
							loading={loading}
							extra={
                                <LastActivity
                                    data={{ last_modification: data?.last_modification || {}, creation: data?.creation || {} }}
                                    title={`Quotation ${data?.code}`}
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
										<List.Item>
											<List.Item.Meta title='Business partner' />
											<Link href={`/business-partners/${data?.bp?.IDbp}`}>
												{data?.bp?.desc}
											</Link>
										</List.Item>
										<List.Item>
											<List.Item.Meta title='Quotation created' />
											<div>
												<Text>{dateFormatter(data?.created_at)}</Text>
											</div>
										</List.Item>

										<List.Item>
											<List.Item.Meta title='Carrier' />
											<div>
												<Text>{data?.carrier?.desc}</Text>
											</div>
										</List.Item>
										<List.Item>
											<List.Item.Meta title='State' />
											<div>
												<Text>{data?.state}</Text>
											</div>
										</List.Item>
									</List>
								</Col>
								<Col span={12}>
									<List>
										<List.Item>
											<List.Item.Meta title='Sale type' />
											<div>
												<Text>{data?.sale_type}</Text>
											</div>
										</List.Item>
										<List.Item>
											<List.Item.Meta title='Expiration Date' />
											<div>
												{data?.expires_at && (
													<Text>{dateFormatter(data?.expires_at)}</Text>
												)}
											</div>
										</List.Item>

										<List.Item>
											<List.Item.Meta title='Currency' />
											<div>
												<Text>
													{data?.currency?.id} - {data?.currency?.name}
												</Text>
											</div>
										</List.Item>

										<List.Item>
											<List.Item.Meta title='Order Type' />
											<div>
												<Text>{data?.order_type?.label}</Text>
											</div>
										</List.Item>
									</List>
								</Col>
							</Row>

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
													<List.Item>
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
													<List.Item>
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
													<List.Item>
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
													<List.Item>
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
												title={() => returnTextToolTip(data?.internal_contact)}
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
												<List.Item style={{ width: "100%" }}>
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
												<List.Item style={{ width: "100%" }}>
													<List.Item.Meta title='Mobile Phone' />
													<div>
														<Text>{data?.internal_contact?.mobile_phone}</Text>
													</div>
												</List.Item>
											</Col>
											<Col
												xs={24}
												sm={24}
												lg={8}
											>
												<List.Item style={{ width: "100%" }}>
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
												title={() => returnTextToolTip(data?.external_contact)}
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
												<List.Item style={{ width: "100%" }}>
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
												<List.Item style={{ width: "100%" }}>
													<List.Item.Meta title='Mobile Phone' />
													<div>
														<Text>{data?.external_contact?.mobile_phone}</Text>
													</div>
												</List.Item>
											</Col>
											<Col
												xs={24}
												sm={24}
												lg={8}
											>
												{" "}
												<List.Item style={{ width: "100%" }}>
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
										<List.Item style={{ width: "100%" }}>
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
										<List.Item style={{ width: "100%" }}>
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
										<List.Item style={{ width: "100%" }}>
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
							loading={loading}
						>
							<List>
								<List.Item>
									<List.Item.Meta title='Invoice Name' />
									<div>
										<Text>{data?.invoice_address?.name}</Text>
									</div>
								</List.Item>

								<List.Item>
									<List.Item.Meta title='Invoice Adreess' />
									<div>
										{wrapText(data?.invoice_address?.full_address, 40, true)}
									</div>
								</List.Item>
								<List.Item>
									<List.Item.Meta title='Payment Method' />
									<div>
										<Text>{data?.payment_method?.label}</Text>
									</div>
								</List.Item>
								<List.Item>
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
							{allCurrencies.length > 0 && (
								<List>
									<List.Item key={"total-costs"}>
										<List.Item.Meta title='Total Costs' />
										<div>
											<PriceDisplay
												currencyId={
													data.company_currency_id || data.currency_id
												}
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
												currencyId={
													data.company_currency_id || data.currency_id
												}
												currencyOptions={allCurrencies}
												price={calculatedPrices.total_profit}
											/>
										</div>
									</List.Item>
								</List>
							)}
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
							currencies={allCurrencies}
						/>
					</Col>
				</Row>
			</div>
		</div>
	);
};
export default Index;
