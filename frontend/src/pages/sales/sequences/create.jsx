import React, { useState } from "react";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import FormBody from "@/shared/sales/sequences/form-sales-sequence";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("sale_sequences.manage")) {
        return false;
    }

    const [loading, setLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);

    return (
        <div className="page">
            <PageActions
                backUrl="/sales/sequences"
                loading={loading}
                title="Add new sales sequence"
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
        <Card loading={loading} title="Sale sequence details"> 
            <FormBody isModal={false} onLoading={(value) => setLoading(value)} changesWatcher={(value) => setIsFormChanged(value)}/>
        </Card>
        </div>
    );
};

export default Create;
