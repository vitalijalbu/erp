import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { IconTrash, IconAlertCircle } from "@tabler/icons-react";
import {
    Row,
    Col,
    Card,
    Form,
    Input,
    Button,
    message,
    Switch,
    Modal,
    Divider,
    Typography,
    Table,
    Select
} from "antd";
import PageActions from "@/shared/components/page-actions";
import {getAllPermissions, createRole, updateRole, getRole} from "@/api/users"
import { useValidationErrors } from "@/hooks/validation-errors";

const { Text } = Typography;
const { confirm } = Modal;


const RoleForm = (props) => {

    const router = useRouter();

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState({});
    const [permissions, setPermissions] = useState([]);
    const validationErrorsBag = useValidationErrors();

    const handleUpdate = async (values) => {
        setLoading(true);
        validationErrorsBag.clear();
        if(props.id) {
            var {status, error, validationErrors} = await updateRole(props.id, form.getFieldsValue());
        }
        else {
            var {status, error, validationErrors} = await createRole(form.getFieldsValue());
        }
        setLoading(false);

        if(error) {
            if(validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
            }
            message.error("Error during saving operation");
        }
        else {
            message.success("Role saved succesfully");
            router.push('/users/roles');
        }
    };

    
    useEffect(() => {
        if(router.isReady) {
            setLoading(true);
            (async () => {
                var {data, error} = await getAllPermissions();
                if(!error) {
                    setPermissions(data.map((permission) => ({label: permission.label, value: permission.id})));
                }
                
                if(props.id) {
                    var {data, error} = await getRole(props.id)
                    if(!error) {
                        data.permissions = data.permissions.map((p) => p.id);
                        form.setFieldsValue(data);
                    }else{
                        router.push('/users/roles');
                        message.error('404 - Record Not Found');
                    }
                }

                setLoading(false);
            })();
        }
    }, [router.isReady]);


    const handleNameChange = () => {
        const nameValue = form.getFieldValue("name");
        const slugValue = generateSlug(nameValue);
        form.setFieldsValue({ label: slugValue });
      };
      const generateSlug = (name) => {
        // Generate slug logic goes here
        // Example: Convert name to lowercase and replace spaces with dashes
        return name.toLowerCase().replace(/\s+/g, "_");
      };
    

      
    return (
        <>
        <div className="page">
            <PageActions
                backUrl="/users/roles"
                loading={loading}
                title={
                    props.id ? (
                      <> Edit Role - <mark>{form.getFieldValue('name')}</mark> </>
                    ): 
                     ("Add new Role")
                  }
                extra={[
                    <Button key="submit" htmlType="submit" type="primary" onClick={handleUpdate} loading={loading}>
                        Save
                    </Button>
                ]}
            />
            <div className="page-content">
                <Row gutter={16}>
                    <Col span={24} loading={loading}>
                        <Card title="Role Informations" loading={loading}>
                            <Form layout="vertical" form={form} onFinish={handleUpdate}>
                                <Row gutter={16}>
                                    <Col span={12}>
                                        <Form.Item label="Name" name="name" {...validationErrorsBag.getInputErrors('name')}>
                                            <Input allowClear onChange={handleNameChange} disabled={props?.id ? 1 : 0}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Role code" name="label" {...validationErrorsBag.getInputErrors('label')}>
                                            <Input allowClear disabled={props?.id ? 1 : 0}/>
                                        </Form.Item>
                                    </Col>
                                    <Col span={12}>
                                        <Form.Item label="Role Permissions" name="permissions" {...validationErrorsBag.getInputErrors('permissions')}>
                                            <Select
                                                mode="multiple"
                                                options={permissions}
                                                filterOption={(input, option) => (option?.label.toLowerCase() ?? '').includes(input.toLowerCase())}
                                                listItemHeight={40}
                                                listHeight={600}
                                                placeholder="Select permissions"
                                                maxTagCount="responsive"
                                            />
                                        </Form.Item>
                                    </Col> 
                                </Row>
                            </Form>
                        </Card>
                    </Col>
                </Row>
            </div>
        </div>
        </>
    );
};

export default RoleForm;
