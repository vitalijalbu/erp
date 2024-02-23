import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import FormBody from "@/shared/sales/pricelists/form-sale-pricelist";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
        return false;
    }

    const [loading, setLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);

    return (
        <div className="page">
            <PageActions
                backUrl="/sales/sales-pricelist"
                loading={loading}
                title="Add new Sale Pricelist"
                extra={[
                    <Button
                        key="submit"
                        htmlType="submit"
                        type="primary"
                        form="form-contact"
                        loading={loading}
                        disabled={!isFormChanged}
                    >
                        Save
                    </Button>
                ]}
            />
        <Card loading={loading} title="Sale pricelist details"> 
            <FormBody isModal={false} onLoading={(value) => setLoading(value)} changesWatcher={(value) => setIsFormChanged(value)}/>
        </Card>
        </div>
    );
};

export default Create;
