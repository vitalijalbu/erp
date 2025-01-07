import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { Menu } from "antd";

const Toolbar = () => {
	const router = useRouter();
	const { id } = router.query;

	const navLinks = [
		{
			key: `/sales/override-discounts/quotations`,
			label: (
				<Link href={`/sales/override-discounts/quotations`}>Quotations</Link>
			),
		},
		{
			key: `/sales/override-discounts/orders`,
			label: <Link href={`/sales/override-discounts/orders`}>Orders</Link>,
		},
	];

	return (
		<Menu
			mode='horizontal'
			items={navLinks}
			selectedKeys={[router.pathname]}
			style={{ marginBottom: "20px" }}
		/>
	);
};

export default Toolbar;
