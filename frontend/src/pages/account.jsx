import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { updateUser } from "@/api/users";
import { getSession, updateSession } from "@/lib/api";
import { useValidationErrors } from "@/hooks/validation-errors";
import { Row, Col, Button, Card, Form, Select, message, Typography } from "antd";
import PageActions from "@/shared/components/page-actions";
import SelectTimezone from "@/shared/form-fields/select-timezone";
import SelectListSeparator from "@/shared/form-fields/user/select-list-separator";
import SelectDecimalSymbol from "@/shared/form-fields/user/select-decimal-symbol";
import SelectLanguage from "@/shared/form-fields/select-language";
const { Title } = Typography;

const Account = () => {
    const router = useRouter();
    const user = getSession();

    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const validationErrorsBag = useValidationErrors();

    //Update form
    const handleUpdate = async (values) => {
        setLoading(true);
        validationErrorsBag.setValidationErrors({});
        var { status, error, errorMsg, validationErrors } = await updateUser(user.id, values);
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error(errorMsg);
        } else {
            message.success("Changes saved succesfully");
            await updateSession();
        }
        setLoading(false);
    };

    useEffect(() => {
        if (router.isReady) {
            setLoading(true);
            //set form values based on user session
            form.setFieldsValue({
                clientTimezoneDB: user?.clientTimezoneDB,
                decimal_symb: user?.decimal_symb,
                language: user?.language,
                list_separator: user?.list_separator,
            });
        }
        setLoading(false);
    }, [router.isReady]);

    return (
        <div className="page">
            <PageActions
                backUrl="/"
                loading={loading}
                title="My account"
                extra={[
                    <Button key={0} type="primary" htmlType="submit" form="form-account" loading={loading}>
                        Save
                    </Button>,
                ]}
            />
            <div className="page-content">
                <Row>
                    <Col span={24}>
                        <Card title="My account" loading={loading}>
                            <Form layout="vertical" form={form} onFinish={handleUpdate} name="form-account">
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
                                    <Col span={12}>
                                        <Form.Item label="Decimal symbol" name="decimal_symb" {...validationErrorsBag.getInputErrors("decimal_symb")}>
                                            <SelectDecimalSymbol />
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="List separator" name="list_separator" {...validationErrorsBag.getInputErrors("list_separator")}>
                                            <SelectListSeparator />
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

export default Account;
