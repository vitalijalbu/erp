import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Modal, message } from "antd";
const { confirm } = Modal;
import { IconTrash } from "@tabler/icons-react";
import Toolbar from "@/shared/sales/discount-matrix/toolbar";
import TableRows from "@/shared/sales/discount-matrix/table-rows";
import { getDiscountMatrix } from "@/api/sales/discount-matrix";

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
			getDiscountMatrix(id)
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
				backUrl='/sales/discount-matrix'
				title={
					<>
						Discount Matrix Rows - <mark>{data?.description}</mark>
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
