import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { Menu, Input, Divider, Flex, Tag } from "antd";
import {
	IconHome,
	IconBook2,
	IconChartBar,
	IconBuildingWarehouse,
	IconReceipt,
	IconCurrencyDollar,
	IconArrowsDoubleNeSw,
	IconAdjustmentsAlt,
	IconTriangleSquareCircle,
	IconBuildingFactory2,
	IconSettingsAutomation,
	IconSearch
} from "@tabler/icons-react";
import { useRouter } from "next/router";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { badgesAtom, reloadAtom } from "@/store/sidenav";
import UserPermissions from "@/policy/ability";
import _ from "lodash";
import { IconDiscount2 } from "@tabler/icons-react";
import { countApproval } from "@/api/sales/discount";
import { IconCheckupList } from "@tabler/icons-react";
import { IconUserQuestion } from "@tabler/icons-react";

const SideNav = () => {
	const router = useRouter();
	const canApprove = UserPermissions.authorizePage(
		"sales_override_discount.manage"
	);

	// Recoil
	const [searchValue, setSearchValue] = useState("");
	const badgeCount = useRecoilValue(badgesAtom);
	const setBadgeCount = useSetRecoilState(badgesAtom);
	const reloadBadge = useRecoilValue(reloadAtom);
	const setReloadBadge = useSetRecoilState(reloadAtom);

	// Count BADGES
	useEffect(() => {
		if (!canApprove) return;
		const countBadges = async () => {
			try {
				// Replace countApproval with your actual API call
				const { data } = await countApproval();
				const countValue = data?.count ?? 0;
				setBadgeCount(countValue);
			} catch (error) {
				console.error("Error counting badges:", error);
			}
		};

		countBadges(); // Initial call
		const intervalId = setInterval(countBadges, 30000); // 30 seconds

		return () => clearInterval(intervalId); // Cleanup the interval on component unmount
	}, [setBadgeCount, reloadBadge]);


	// Define Menu Links
	const menuItems = [
		{
			key: "/",
			icon: <IconHome />,
			label: <Link href='/'>Dashboard</Link>,
		},
		{
			key: "master-data",
			icon: <IconTriangleSquareCircle />,
			label: "Master Data",
			children: [
				...UserPermissions.ifCan(
					"items.management",
					{},
					[
						{
							key: "/items-master-data",
							label: "Item Master Data",
							children: [
								...UserPermissions.ifCan(
									"items.management",
									{},
									[
										{
											key: "/items",
											label: <Link href='/items'>Items</Link>,
										},
										{
											key: "/items/create",
											label: <Link href='/items/create'>Item Add</Link>,
										},
										{
											key: "/unit-measure",
											label: (
												<Link href='/unit-measure'>Unit of measure table</Link>
											),
										},
									],
									[]
								),
							],
						},
						...UserPermissions.ifCan(
							"bp.management",
							{},
							[
								{
									key: "/bp",
									label: "Business Partners",
									children: [
										{
											key: "/business-partners",
											label: (
												<Link href='/business-partners'>Business Partners</Link>
											),
										},
										{
											key: "/business-partners/groups",
											label: (
												<Link href='/business-partners/groups'>
													Business Partners Groups
												</Link>
											),
										},
									],
								},
								{
									key: "/contacts",
									label: <Link href='/contacts'>Contacts</Link>,
								},
								{
									key: "/addresses",
									label: <Link href='/addresses'>Addresses</Link>,
								},
								{
									key: "/geo-db/geo-elements",
									label: <Link href='/geo-db/geo-elements'>Geo DB</Link>,
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							"configurator.manage",
							{},
							[
								{
									key: "/routing",
									label: "Routing",
									children: [
										{
											key: "/processes",
											label: <Link href='/processes'>Processes</Link>,
										},
										...UserPermissions.ifCan(
											"machines.management", // TODO: change with final one
											{},
											[
												{
													key: "/machines",
													label: <Link href='/machines'>Machines</Link>,
												},
											]
										),
									],
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							"warehouses.management",
							{},
							[
								{
									key: "/warehouses",
									label: <Link href='/warehouses'>Warehouse</Link>,
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							"workcenters.manage",
							{},
							[
								{
									key: "/workcenters",
									label: <Link href='/workcenters'>Workcenters</Link>,
								},
							],
							[]
						),

						// ...UserPermissions.ifCan("bp.management", {}, [
						// {
						// 	key: "/geo-db",
						// 	label: "Geo DB",
						// 	children: [
						// 			{
						// 				key: "/addresses",
						// 				label: <Link href="/addresses">Addresses</Link>,
						// 			},
						// 			{
						// 				key: "/geo-db/geo-elements",
						// 				label: <Link href="/geo-db/geo-elements">Geo DB</Link>,
						// 			},
						//     ],
						//   },
						// ],[]),
					],
					[]
				),
			],
		},

		{
			key: "/purchases",
			label: "Purchases",
			icon: <IconDiscount2 />,
			children: [
				...UserPermissions.ifCan(
					"users.management",
					{},
					[
						{
							key: "/purchases/purchases-pricelist",
							label: (
								<Link href='/purchases/purchases-pricelist'>Pricelist</Link>
							),
						},
					],
					[]
				),
			],
		},

		{
			key: "/sales",
			icon: <IconTriangleSquareCircle />,
			label: "Sales",
			children: [
				...UserPermissions.ifCan(
					"items.management",
					{},
					[
						{
							key: "/sales/quotations",
							label: <Link href='/sales/quotations'>Quotations</Link>,
						},
						{
							key: "/sales/orders",
							label: <Link href='/sales/orders'>Orders</Link>,
						},
						{
							key: "/sales/sequences",
							label: <Link href='/sales/sequences'>Sequences</Link>,
						},
						...UserPermissions.ifCan(
							"sales_override_discount.manage",
							{},
							[
								{
									key: "/sales/override-discounts/quotations",
									label: (
										<Link href='/sales/override-discounts/quotations'>
											<Flex
												justify='space-between'
												align='center'
											>
												Override Discount
												<Tag color={badgeCount > 0 ? "green" : null}>
													{badgeCount}
												</Tag>
											</Flex>
										</Link>
									),
								},
							],
							[]
						),

						{
							key: "/sales-prices",
							label: "Sales Prices",
							children: [
								...UserPermissions.ifCan(
									"sales_price_lists.manage",
									{},
									[
										{
											key: "/sales/sales-pricelist",
											label: (
												<Link href='/sales/sales-pricelist'>Pricelist</Link>
											),
										},
										{
											key: "/sales/discount-matrix",
											label: (
												<Link href='/sales/discount-matrix'>
													Discount Matrix
												</Link>
											),
										},
										{
											key: "/sales/discount-total-matrix",
											label: (
												<Link href='/sales/discount-total-matrix'>
													Discount Total Matrix
												</Link>
											),
										},
									],
									[]
								),
							],
						},
					],
					[]
				),
			],
		},
		{
			key: "crm",
			icon: <IconUserQuestion />,
			label: "CRM",
			title: "CRM",
		},
		{
			key: "qms",
			icon: <IconCheckupList />,
			label: "QMS",
			title: "QMS",
		},
		{
			key: "warehouse",
			icon: <IconBuildingFactory2 />,
			label: "Warehouse",
			title: "Stock Mov.",
			children: [
				...UserPermissions.ifCan(
					"items_stocks.show",
					{},
					[
						{
							key: "/stocks",
							icon: <IconBuildingWarehouse />,
							label: <Link href='/stocks'>Stock view</Link>,
						},
					],
					[]
				),
				{
					key: "materials",
					icon: <IconArrowsDoubleNeSw />,
					label: "Stock Mov.",
					children: [
						...UserPermissions.ifCan(
							"materials.management",
							{},
							[
								{
									key: "/materials/issue",
									label: <Link href='/materials/issue'>Issue plan</Link>,
								},
								{
									key: "/materials/transfer",
									label: <Link href='/materials/transfer'>Transfer plan</Link>,
								},
							],
							[]
						),
					],
				},
				{
					key: "receipts",
					icon: <IconReceipt />,
					label: "Receipts",
					children: [
						...UserPermissions.ifCan(
							"items_receipts.management",
							{},
							[
								{
									key: "/receipts/purchased",
									label: <Link href='/receipts/purchased'>Purchased</Link>,
								},
								{
									key: "/receipts/chiorino",
									label: (
										<Link href='/receipts/chiorino'>From Chiorino S.p.A</Link>
									),
								},
								{
									key: "/receipts/print",
									label: <Link href='/receipts/print'> Print label range</Link>,
								},
							],
							[]
						),
					],
				},
				{
					key: "reports",
					icon: <IconChartBar />,
					label: "Reports",
					children: [
						...UserPermissions.ifCan(
							"report.show",
							{},
							[
								{
									label: (
										<Link href='/reports/cutting/history'>Cutting history</Link>
									),
									key: "/reports/cutting/history",
								},
								{
									label: (
										<Link href='/reports/cutting/waste'>Cutting waste</Link>
									),
									key: "/reports/cutting/waste",
								},
								{
									label: (
										<Link href='/reports/cutting/active'>Cutting active</Link>
									),
									key: "/reports/cutting/active",
								},
								{
									label: (
										<Link href='/reports/lots/tracking'>Lot tracking</Link>
									),
									key: "/reports/lots/tracking",
								},
								{
									label: (
										<Link href='/reports/stock-width'>Stock by width</Link>
									),
									key: "/reports/stock-width",
								},
								{
									label: (
										<Link href='/reports/transaction-history'>
											Transactions history
										</Link>
									),
									key: "/reports/transaction-history",
								},
								{
									label: (
										<Link href='/reports/unload-item'>
											Unloaded item by date
										</Link>
									),
									key: "/reports/unload-item",
								},
								{
									label: (
										<Link href='/reports/lots/shipped'>
											Lot shipped to Business Part.
										</Link>
									),
									key: "/reports/lots/shipped",
								},
								{
									label: (
										<Link href='/reports/lots/received'>
											Lot received from Supp.
										</Link>
									),
									key: "/reports/lots/received",
								},
								{
									label: <Link href='/reports/activity'>Activity viewer</Link>,
									key: "/reports/activity",
								},
								{
									label: <Link href='/reports/stock-limits'>Stock limits</Link>,
									key: "/reports/stock-limits",
								},
								{
									label: (
										<Link href='/reports/graphs/stock-date'>
											Graph stock at date
										</Link>
									),
									key: "/reports/graphs/stock-date",
								},
								{
									label: (
										<Link href='/reports/purchases'>
											Open Purchases from Chiorino SPA
										</Link>
									),
									key: "/reports/purchases",
								},
								...UserPermissions.ifCan(
									"items_stocks.show",
									{},
									[
										{
											key: "/reports/stock-all",
											label: (
												<Link href='/reports/stock-all'>Report Stock All</Link>
											),
										},
									],
									[]
								),
							],
							[]
						),
					],
				},
				{
					key: "inventory",
					icon: <IconBook2 />,
					label: "Inventory",
					children: [
						...UserPermissions.ifCan(
							"inventory.management",
							{},
							[
								{
									key: "/inventory",
									label: <Link href='/inventory'>Inventory master data</Link>,
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							["inventory.management", "items_stocks.show"],
							{},
							[
								{
									key: "/inventory/check",
									label: (
										<Link href='/inventory/check'>
											Inventory single lot check
										</Link>
									),
								},
							],
							[]
						),
					],
				},
				{
					key: "/adjustment",
					icon: <IconAdjustmentsAlt />,
					label: "Adjustment",
					children: [
						...UserPermissions.ifCan(
							"warehouse_adjustments.management",
							{},
							[
								{
									key: "/adjustment/lots/stock",
									label: <Link href='/adjustment/lots/stock'>Stock Lots</Link>,
								},
								{
									key: "/adjustment/items",
									label: <Link href='/adjustment/items'>Add Lots</Link>,
								},
								{
									key: "/adjustment/lots/update",
									label: (
										<Link href='/adjustment/lots/update'>Update Lots info</Link>
									),
								},
							],
							[]
						),
					],
				},
			],
		},
		,
		{
			key: "/production",
			icon: <IconTriangleSquareCircle />,
			label: "Production",
			children: [
				// {
				// 	key: "/production-orders",
				// 	label: <Link href="#">Production Orders</Link>,
				// },
				// {
				// 	key: "/cutting-orders",
				// 	label: <Link href="#">Cutting Orders</Link>,
				// },
				// {
				// 	key: "/shipping",
				// 	label: <Link href="#">Shipping</Link>,
				// },
			],
		},
		{
			key: "integrations",
			icon: <IconTriangleSquareCircle />,
			label: "Integrations",
			children: [
				// {
				// 	key: "active-invoice",
				// 	label: <Link href="#">Active invoice</Link>,
				// },
				// {
				// 	key: "passive-invoice",
				// 	label: <Link href="#">Passive invoice</Link>,
				// },
				// {
				// 	key: "/shipping-software",
				// 	label: "Shipping Software",
				// 	children: [
				// 		{
				// 			key: "/shipping-ups",
				// 			label: <Link href="#">UPS</Link>,
				// 		},
				// 		{
				// 			key: "/shipping-fedex",
				// 			label: <Link href="#">Fedex</Link>,
				// 		},
				// 	],
				// },
				// {
				// 	key: "/talentia",
				// 	label: <Link href="#">Talentia</Link>,
				// },
				// {
				// 	key: "/power-bi",
				// 	label: <Link href="#">PowerBI</Link>,
				// },
			],
		},
		{
			key: "/finance",
			icon: <IconCurrencyDollar />,
			label: "Finance",
			children: [
				{
					key: "/stock-evaluation",
					icon: <IconCurrencyDollar />,
					label: "Stock Evaluation",
					children: [
						...UserPermissions.ifCan(
							"items_value.management",
							{},
							[
								{
									key: "/lots/value-check",
									label: (
										<Link href='/lots/value-check'>Lot value to check</Link>
									),
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							"items_value.show",
							{},
							[
								{
									key: "/reports/lots/value-history",
									label: (
										<Link href='/reports/lots/value-history'>
											Lot value history
										</Link>
									),
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							["report.show", "items_value.show"],
							{},
							[
								{
									key: "/reports/stock-value/group",
									label: (
										<Link href='/reports/stock-value/group'>
											Report stock value by group
										</Link>
									),
								},
								{
									key: "/reports/stock-value/item",
									label: (
										<Link href='/reports/stock-value/item'>
											Report stock value by item
										</Link>
									),
								},
								{
									key: "/reports/stock-value/value",
									label: (
										<Link href='/reports/stock-value/value'>
											Report stock value on date
										</Link>
									),
								},
								{
									key: "/reports/stock-value/detail",
									label: (
										<Link href='/reports/stock-value/detail'>
											Stock on date (lot detail)
										</Link>
									),
								},
							],
							[]
						),
						...UserPermissions.ifCan(
							"wac.management",
							{},
							[
								{
									key: "/reports/wac/layers",
									label: (
										<Link href='/reports/wac/layers'>
											WAC year layer manager
										</Link>
									),
								},
								{
									key: "/reports/wac/calc-simulation",
									label: (
										<Link href='/reports/wac/calc-simulation'>
											WAC calc. simulation
										</Link>
									),
								},
								{
									key: "/reports/wac/year",
									label: (
										<Link href='/reports/wac/year'>WAC calc. ytd report</Link>
									),
								},
								{
									key: "/reports/wac/year-lots",
									label: (
										<Link href='/reports/wac/year-lots'>
											WAC calc. ytd report lots details
										</Link>
									),
								},
							],
							[]
						),
					],
				},
			],
		},

		{
			key: "system-admin",
			icon: <IconSettingsAutomation />,
			label: "System Administration",
			children: [
				...UserPermissions.ifCan(
					"users.management",
					{},
					[
						{
							key: "/users",
							label: <Link href='/users'>Users Management</Link>,
						},
						{
							key: "/users/roles",
							label: <Link href='/users/roles'>Roles Management</Link>,
						},
						{
							key: "/settings/closing-days",
							label: <Link href='/settings/closing-days'>Closing days</Link>,
						},
					],
					[]
				),
				...UserPermissions.ifCan(
					"bp.management",
					{},
					[
						// {
						// 	key: "/company-management",
						// 	label: <Link href="#">Company Management</Link>,
						// },
					],
					[]
				),
				{
					key: "/configurator",
					label: "Product Configurator Management",
					children: [
						{
							key: "/configurator/functions",
							label: <Link href='/configurator/functions'>Functions</Link>,
						},
						{
							key: "/configurator/standard-products",
							label: (
								<Link href='/configurator/standard-products'>
									Standard Products
								</Link>
							),
						},
						{
							key: "/configurator/features",
							label: <Link href='/configurator/features'>Features</Link>,
						},
						{
							// menu item and link item need a different key to be opened on refresh
							key: "/configurator-constraints",
							label: "Constraints",
							children: [
								{
									key: "/configurator/constraints",
									label: (
										<Link href='/configurator/constraints'>
											Configuration Constraints
										</Link>
									),
								},
								{
									key: "/configurator/bom-constraints",
									label: (
										<Link href='/configurator/bom-constraints'>
											BOM Constraints
										</Link>
									),
								},
								{
									key: "/configurator/routing-constraints",
									label: (
										<Link href='/configurator/routing-constraints'>
											Routing Constraints
										</Link>
									),
								},
								{
									key: "/configurator/pricing-constraints",
									label: (
										<Link href='/configurator/pricing-constraints'>
											Pricing Constraints
										</Link>
									),
								},
							],
						},
					],
				},
			],
		},
	];

	//remove empty entries
	const mainMenu = menuItems.filter((entry) =>
		entry.children == undefined
			? true
			: entry.children.filter((child) => !!child.key).length > 0
	);

	//=============================================================================
	// Set opened Default Item based on Parent Key
	//=============================================================================
	const { pathname } = router;
	// Remove [id] from the pathname to match the parent path
	const firstUrlPath = pathname.replace(/\/\[id\].*$/, "");
	// const pathArray = firstUrlPath.split('/').filter(Boolean);

	//  console.log('pathname', pathname);
	//  console.log('firstUrlPath', firstUrlPath);
	//  console.log('pathArray', pathArray);

	// Construct the array of parent keys of menuItems
	const findParentKeys = (obj, targetKey) => {
		if (_.isObject(obj) && obj.key) {
			if (obj.key === targetKey) {
				return [obj.key];
			}
			const childrenKeys = _.isArray(obj.children)
				? _.flatMapDeep(obj.children, (child) =>
						findParentKeys(child, targetKey)
				  )
				: [];
			return childrenKeys.length ? [obj.key, ...childrenKeys] : [];
		}
		return [];
	};
	// Get array to set default Open
	const parentKeysArray = useMemo(() => {
		return _.flatMapDeep(menuItems, (obj) => findParentKeys(obj, firstUrlPath));
	}, [menuItems, firstUrlPath]);

	//console.log('parentKeysArray', parentKeysArray);

	//=============================================================================
	// Search menu here
	//=============================================================================

	const handleSearch = (value) => {
		setSearchValue(value);
	};

	const filterMenuItems = (items, searchValue) => {
		const keywords = searchValue.toLowerCase().split(" ");

		return items.filter((item) => {
			const key =
				item.key && typeof item.key === "string" && item.key.toLowerCase();
			const label =
				item.label &&
				item.label.props &&
				item.label.props.children &&
				typeof item.label.props.children === "string" &&
				item.label.props.children.toLowerCase();

			const hasMatch = keywords.every(
				(keyword) =>
					(key && key.includes(keyword)) || (label && label.includes(keyword))
			);

			if (hasMatch) {
				return true;
			}

			if (item.children) {
				const filteredChildren = filterMenuItems(item.children, searchValue);
				if (filteredChildren.length > 0) {
					item.children = filteredChildren;
					return true;
				}
			}

			return false;
		});
	};

	// Filter the menu here
	const filteredMenu = filterMenuItems(mainMenu, searchValue.toLowerCase());

	return (
		<div className='sidenavs'>
			<div className='top'>
				<div className='p-1'>
					<Input
						allowClear
						placeholder='Search pages'
						onChange={(e) => handleSearch(e.target.value)}
						prefix={
							<IconSearch
								size='16'
								color='#ccc'
							/>
						}
					/>
				</div>
				<Divider style={{ margin: 0 }} />
				<Menu
					inlineIndent='10'
					mode='inline'
					selectable
					theme='light'
					items={filteredMenu}
					selectedKeys={[firstUrlPath]}
					defaultOpenKeys={parentKeysArray}
				/>
			</div>
		</div>
	);
};
export default SideNav;
