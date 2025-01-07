import { Button, Divider, Modal, Table } from "antd";
import _ from "lodash";
import { useEffect, useState } from "react";
import {
	componentCols,
	itemPriceCols,
	processCols,
	totalsGroupPriceCols,
	totalsPriceCols,
} from "@/hooks/useRowPriceDetailsColumns";

const RowPriceDetailsModal = ({
	open,
	onToggle,
	detailObj,
	currencies,
	currencyId,
	companyCurrencyId,
}) => {
	const [pricesByGroup, setPricesByGroup] = useState({});
	const [pricesByProcess, setPricesByProcess] = useState({});

	useEffect(() => {
		setPricesByGroup(
			_.groupBy(
				_.filter(
					detailObj.sale_price_components,
					(o) => !_.isNull(o.standard_product_sale_pricing_group_name)
				),
				"standard_product_sale_pricing_group_id"
			)
		);
		setPricesByProcess(
			_.groupBy(
				_.filter(detailObj.sale_price_components, (o) => !_.isNull(o.process_id)),
				"process_id"
			)
		);
	}, []);

	const mapWithoutNulls = (data, field) => {
		return _.map(data, (o) => {
			if (!_.isNull(o[field])) return o[field];
		});
	};

	const createTotalsObject = (data) => {
		const obj = new Object({
			id: Math.floor(Math.random() * 1000),
			item: null,
			note: "",
			quantity: <b>Totals :</b>,
			price: "",
			discount: _.sum(mapWithoutNulls(data, "discount")),
			profit: _.sum(mapWithoutNulls(data, "profit")),
			total_discount: _.sum(mapWithoutNulls(data, "total_discount")),
			total_price: _.sum(mapWithoutNulls(data, "total_price")),
			total: _.sum(mapWithoutNulls(data, "total")),
		});
		console.log(obj);
		return obj;
	};
	return (
		<Modal
			open={open}
			width={"82%"}
			title="Row Price Details"
			transitionName="ant-modal-slide-up"
			centered
			onCancel={() => onToggle(false)}
			footer={[
				<Button
					key={0}
					onClick={() => onToggle(false)}
				>
					Close
				</Button>,
			]}
		>
			<div>
				<div className="mb-2">
					{Object.keys(pricesByGroup).map((v) => {
						return (
							<>
								<Divider orientation="left">
									{pricesByGroup[
										v
									][0].standard_product_sale_pricing_group_name.toUpperCase()}
								</Divider>
								<Table
									dataSource={[
										...pricesByGroup[v],
										createTotalsObject(pricesByGroup[v]),
									]}
									columns={componentCols(
										currencyId,
										currencies,
										companyCurrencyId
									)}
									pagination={false}
									rowKey={(row) => row.id}
									// rowClassName="row-align-top"
									rowClassName={(record, index) =>
										index === pricesByGroup[v].length
											? "bg-dark"
											: "row-align-top"
									}
									bordered
									// className="last-row-grey"
								/>
								{/* <Table
									dataSource={[createTotalsObject(pricesByGroup[v])]}
									columns={totalsGroupPriceCols(
										currencyId,
										currencies,
										companyCurrencyId
									)}
									rowKey={(row) => row.id}
									pagination={false}
									showHeader={false}
									rowClassName={(record, index) => "bg-dark"}
								/> */}
							</>
						);
					})}
				</div>
				<div className="mb-2">
					{Object.keys(pricesByProcess).map((v) => {
						return (
							<>
								<Divider orientation="left">
									{pricesByProcess[v][0].process?.name.toUpperCase()}
								</Divider>
								<Table
									dataSource={[
										...pricesByProcess[v],
										createTotalsObject(pricesByProcess[v]),
									]}
									columns={componentCols(
										currencyId,
										currencies,
										companyCurrencyId
									)}
									pagination={false}
									rowClassName={(record, index) =>
										index === pricesByProcess[v].length
											? "bg-dark"
											: "row-align-top"
									}
									rowKey={(row) => row.id}
									bordered
								/>
								{/* <Table
									dataSource={[createTotalsObject(pricesByProcess[v])]}
									columns={totalsGroupPriceCols(
										currencyId,
										currencies,
										companyCurrencyId
									)}
									rowKey={(row) => row.id}
									pagination={false}
									showHeader={false}
									rowClassName={(record, index) => "bg-dark"}
								/> */}
							</>
						);
					})}
				</div>
				{!detailObj?.item?.configuration &&
					detailObj?.sale_price_components?.length > 0 && (
						<div className="mb-2">
							<Divider orientation="left">Components</Divider>
							<Table
								dataSource={detailObj.sale_price_components}
								columns={componentCols(currencyId, currencies, companyCurrencyId)}
								pagination={false}
								rowClassName="row-align-top"
								rowKey={(row) => row.id}
							/>
						</div>
					)}
				<div className="mb-2">
					<Divider orientation="left">Row Item</Divider>
					<Table
						dataSource={[detailObj]}
						columns={itemPriceCols(currencyId, currencies, companyCurrencyId)}
						pagination={false}
						rowClassName="row-align-top"
						rowKey={(row) => row.id}
						bordered
					/>
					{/* <Table
						dataSource={[detailObj]}
						columns={totalsPriceCols(currencyId, currencies, companyCurrencyId)}
						pagination={false}
						showHeader={false}
						rowKey={(row) => row.id}
						rowClassName={(record, index) => "bg-dark"}
					/> */}
				</div>
			</div>
		</Modal>
	);
};

export default RowPriceDetailsModal;
