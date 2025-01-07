import Link from "next/link";
import React from "react";
import { useRouter } from "next/router";
import { Menu } from "antd";

const Toolbar = () => {
	const router = useRouter();
	const { id } = router.query;

	const navLinks = [
		{
			key: `/configurator/standard-products/[id]`,
			label: (
				<Link href={`/configurator/standard-products/${id}`}>
					Product details
				</Link>
			),
		},
		{
			key: `/configurator/standard-products/[id]/configuration`,
			label: (
				<Link href={`/configurator/standard-products/${id}/configuration`}>
					Configuration
				</Link>
			),
		},
		{
			key: `/configurator/standard-products/[id]/bom`,
			label: (
				<Link href={`/configurator/standard-products/${id}/bom`}>BOM</Link>
			),
		},
		{
			key: `/configurator/standard-products/[id]/routing`,
			label: (
				<Link href={`/configurator/standard-products/${id}/routing`}>
					Routing
				</Link>
			),
		},
		{
			key: `/configurator/standard-products/[id]/sales-pricing`,
			label: (
				<Link href={`/configurator/standard-products/${id}/sales-pricing`}>
					Sales Pricing
				</Link>
			),
		},
	];

	return (
		<Menu
			mode='horizontal'
			items={navLinks}
			selectedKeys={[router.pathname]}
		/>
	);
};

export default Toolbar;
