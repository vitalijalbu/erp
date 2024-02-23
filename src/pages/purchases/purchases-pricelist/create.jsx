import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import FormBody from "@/shared/purchases/pricelists/form-sale-pricelist";

const Create = (props) => {
	//Set page permissions
	if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
		return false;
	}

	const [loading, setLoading] = useState(false);
	const [isFormChanged, setIsFormChanged] = useState(false);

	return (
		<div className='page'>
			<PageActions
				backUrl='/purchases/purchases-pricelist'
				loading={loading}
				title='Add new Purchases Pricelist'
				extra={[
					<Button
						key='submit'
						htmlType='submit'
						type='primary'
						form='form-contact'
						loading={loading}
						disabled={!isFormChanged}
					>
						Save
					</Button>,
				]}
			/>
			<Card
				loading={loading}
				title='Puchases pricelist details'
			>
				<FormBody
					isModal={false}
					onLoading={(value) => setLoading(value)}
					changesWatcher={(value) => setIsFormChanged(value)}
				/>
			</Card>
		</div>
	);
};

export default Create;
