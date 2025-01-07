import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu } from "antd";

const Toolbar = () => {
	const router = useRouter();
	const { id } = router.query;

	const navLinks = [
		{
			key: "/purchases/purchases-pricelist/[id]",
			label: <Link href={`/purchases/purchases-pricelist/${id}`}>Details</Link>,
		},
		{
			key: "/purchases/purchases-pricelist/[id]/rows",
			label: (
				<Link href={`/purchases/purchases-pricelist/${id}/rows`}>
					Item Rows
				</Link>
			),
		},
	];

	return (
		<Menu
			mode='horizontal'
			className='transparent'
			items={navLinks}
			selectedKeys={[router.pathname]}
		/>
	);
};

export default Toolbar;
