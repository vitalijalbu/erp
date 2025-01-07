import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import Toolbar from "@/shared/purchases/pricelists/toolbar";
import TableRows from "@/shared/purchases/pricelists/table-rows";
import { getPurchasesPricelist } from "@/api/purchases/pricelist";

const Index = () => {
	//Set page permissions
	if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
		return false;
	}

	const router = useRouter();
	const { id } = router.query;

	const [loading, setLoading] = useState(false);
	const [reload, setReload] = useState(1);
	const [data, setData] = useState(null);

	useEffect(() => {
		if (router.isReady && id) {
			setLoading(true);
			getPurchasesPricelist(id)
				.then((response) => {
					if (response.data) {
						setData(response.data);
					}
				})
				.finally(() => {
					setLoading(false);
				});
		}
	}, [router.isReady, id, reload]);

	return (
		<div className='page'>
			<PageActions
				loading={loading}
				backUrl='/purchases/purchases-pricelist'
				title={
					<>
						{" "}
						Edit Purchases Pricelist Rows - <mark>{data?.code}</mark>
					</>
				}
			>
				<Toolbar />
			</PageActions>

			<TableRows
				loading={loading}
				currency={data?.currency}
			/>
		</div>
	);
};

export default Index;
