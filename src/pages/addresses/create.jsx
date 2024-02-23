import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import AddressForm from "@/shared/addresses/form-body";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const [loading, setLoading] = useState(false);

    return (
        <div className="page">
            <PageActions
                backUrl="/addresses"
                title={'Add new Address'}
                loading={loading}
                extra={[
                    <Button
                        key="submit"
                        htmlType="submit"
                        type="primary"
                        form="address-form"
                        loading={loading}
                    // icon={ <IconPlus/>}
                    >
                        Save
                    </Button>
                ]}
            />
            <Card loading={loading}>
                <AddressForm onLoading={(value) => setLoading(value)} />
            </Card>
        </div>
    );
};

export default Create;
