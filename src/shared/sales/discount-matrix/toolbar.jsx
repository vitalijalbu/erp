import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Menu } from "antd";

const Toolbar = () => {
	const router = useRouter();
	const { id } = router.query;

	const navLinks = [
		{
			key: "/sales/discount-matrix/[id]",
			label: <Link href={`/sales/discount-matrix/${id}`}>Details</Link>,
		},
		{
			key: "/sales/discount-matrix/[id]/rows",
			label: (
				<Link href={`/sales/discount-matrix/${id}/rows`}>
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
