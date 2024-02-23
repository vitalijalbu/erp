import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Row, Col, Card, Form, Input, Button, message, Select } from "antd";
import PageActions from "@/shared/components/page-actions";
import { getAllRoles, createUser, getUser, updateUser } from "@/api/users";
import { useValidationErrors } from "@/hooks/validation-errors";
import { getSession, updateSession } from "@/lib/api";
import LastActivity from "./last-activity";
import SelectCompanyWorkcenter from "@/shared/form-fields/select-company-workcenter";
import SelectEmployee from "@/shared/form-fields/user/select-employee";
import SelectWarehouse from "@/shared/form-fields/user/select-warehouse";
import SelectCompany from "@/shared/form-fields/select-company";
import SelectTimezone from "@/shared/form-fields/select-timezone";
import SelectRoles from "@/shared/form-fields/user/select-roles";
import SelectDecimalSymbol from "../form-fields/user/select-decimal-symbol";
import SelectListSeparator from "../form-fields/user/select-list-separator";
import SelectLanguage from "../form-fields/select-language";

const UserForm = (props) => {
    const { id } = props;

    const router = useRouter();

    const [form] = Form.useForm();
    const companyId = Form.useWatch("IDcompany", form); // define real-time form value companyID

    const [loading, setLoading] = useState(false);
    const [reload, setReload] = useState(1);
    const validationErrorsBag = useValidationErrors();
    const [isFormChanged, setIsFormChanged] = useState(false);
    const [data, setData] = useState(null);

    useEffect(() => {
        if (router.isReady) {
            if (id) {
                setLoading(true);
                (async () => {
                    const { data, error } = await getUser(id);
                    setData(data);
                    if (!error) {
                        form.setFieldsValue(data);
                        setLoading(false);
                    } else {
                        router.push("/users");
                        message.error("The user cannot be found");
                    }
                })();
                //setLoading(false);
            }
        }
    }, [router.isReady, id, reload]);

    // Submit Form
    const handleUpdate = async (values) => {
        setLoading(true);
        validationErrorsBag.clear();
        if (id) {
            var { status, error, errorMsg, validationErrors } = await updateUser(id, values);
            //if the user is the same as the loggedin user, update the current session with new data
            if (getSession().id == id) {
                await updateSession();
            }
        } else {
            var { status, error, errorMsg, validationErrors } = await createUser(values);
        }
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(errorMsg);
        } else {
            message.success(`User ${id ? "updated" : "created"} successfully`);
        }
        setLoading(false);
    };

    // Set some fields to NULL if Company Changes
    const handleCompanyChange = () => {
        form.setFieldsValue({
            IDwarehouseUserDef: null, 
            employee_contact_id: null,
            default_workcenter: null
        })
    }

    return (
        <div className="page">
            <PageActions
                loading={loading}
                backUrl="/users"
                title={
                    id ? (
                        <>
                            Edit User - <mark>{form.getFieldValue("username")}</mark>
                        </>
                    ) : (
                        "Add new User"
                    )
                }
                extra={[
                    <Button key="submit" htmlType="submit" form="form-user" type="primary" loading={loading} disabled={!isFormChanged}>
                        Save
                    </Button>
                ]}
            />
            <div className="page-content">
                <Row gutter={16}>
                    <Col span={24}>
                        <Card
                            title="User details"
                            loading={loading}
                            extra={
                                <LastActivity
                                    data={{ last_modification: data?.last_modification || {}, creation: data?.creation || {} }}
                                    title={data?.username}
                                />
                            }
                        >
                            <Form layout="vertical" form={form} onFinish={handleUpdate} name="form-user" onValuesChange={() => setIsFormChanged(true)}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Username"
                                            name="username"
                                            {...validationErrorsBag.getInputErrors("username")}
                                        >
                                            <Input allowClear />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Employee contact"
                                            name="employee_contact_id"
                                            {...validationErrorsBag.getInputErrors("employee_contact_id")}
                                        >
                                            <SelectEmployee companyId={companyId}/>
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Company" name="IDcompany" {...validationErrorsBag.getInputErrors("IDcompany")}>
                                            <SelectCompany onChange={handleCompanyChange}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Default Warehouse"
                                            name="IDwarehouseUserDef"
                                            {...validationErrorsBag.getInputErrors("IDwarehouseUserDef")}
                                        >
                                            <SelectWarehouse companyId={companyId} />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Default Workcenter"
                                            name="default_workcenter"
                                            {...validationErrorsBag.getInputErrors("default_workcenter")}
                                        >
                                            <SelectCompanyWorkcenter companyId={companyId} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Default User Timezone"
                                            name="clientTimezoneDB"
                                            {...validationErrorsBag.getInputErrors("clientTimezoneDB")}
                                        >
                                            <SelectTimezone />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Language" name="language" {...validationErrorsBag.getInputErrors("language")}>
                                            <SelectLanguage />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item
                                            label="Decimal Symbol (used to formatting CSV export, numbers etc ...):"
                                            name="decimal_symb"
                                            {...validationErrorsBag.getInputErrors("decimal_symb")}
                                        >
                                            <SelectDecimalSymbol />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item
                                            label="List separator (used to formatting CSV export):"
                                            name="list_separator"
                                            {...validationErrorsBag.getInputErrors("list_separator")}
                                        >
                                            <SelectListSeparator />
                                        </Form.Item>
                                    </Col>
                                    <Col span={24}>
                                        <Form.Item label="Roles" name="roles" {...validationErrorsBag.getInputErrors("roles")}>
                                            <SelectRoles />
                                        </Form.Item>
                                    </Col>
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default UserForm;
