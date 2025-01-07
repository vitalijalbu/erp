import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card } from "antd";
import FormBody from "@/shared/contacts/form-body";



const Create = (props) => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [isFormChanged, setIsFormChanged] = useState(false);

    return (
        <div className="page">
            <PageActions
                backUrl="/contacts"
                loading={loading}
                title="Add new Contact"
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
        <Card loading={loading} title="Contact details"> 
            <FormBody isModal={false} onLoading={(value) => setLoading(value)} changesWatcher={(value) => setIsFormChanged(value)}/>
        </Card>
        </div>
    );
};

export default Create;
