import { getAllUsers } from "@/api/users";
import UserPermissions from "@/policy/ability";
import {
    Button,
    Card,
    Col,
    Divider,
    Form,
    Input,
    Modal,
    Row,
    Space,
    Table,
    Tag,
    message,
} from "antd";
import PageActions from "@/shared/components/page-actions";
import * as dayjs from "dayjs";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ExclamationCircleFilled } from '@ant-design/icons';
import { deleteUser } from "@/api/users";
import Datatable from "@/shared/datatable/datatable";
import {
    IconPencilMinus,
    IconTrash,
    IconPlus
} from "@tabler/icons-react";

const { confirm } = Modal;

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("users.management")) {
        return false;
    }
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    const [reload, setReload] = useState(0);

    const showDeleteConfirm = (userId) => {
        confirm({
            title: 'Do you want to delete the user?',
            icon: <ExclamationCircleFilled color="#faad14" size="24" className="anticon"/>,
            transitionName: "ant-modal-slide-up",
            content: 'The user will be deleted permanently',
            async onOk() {
                const { status } = await deleteUser(userId);
                if (status) {
                    message.success("User deleted successfully");
                }
                else {
                    message.error("Error during user deleting")
                }

                setReload(reload + 1);
            },
            onCancel() {

            },
        });
    };

    const handleTableChange = async (params) => {
        const result = await getAllUsers(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Username",
            key: "username",
            dataIndex: "username",
            sorter: false
        },
        {
            title: "Company",
            key: "company",
            sorter: false
        },
        {
            title: "Roles",
            key: "roles",
            sorter: false,
            render: ({ roles }) => (
                <Space split={<Divider type="vertical" />}>
                    {roles.map((role) => (
                        <Tag key={role.id}>{role.label}</Tag>
                    ))}
                </Space>
            ),
        },
       
        {
            title: "Default Warehouse",
            key: "default_warehouse",
            sorter: false
        },
        {
            title: "Default Timezone",
            key: "default_timezone",
            sorter: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Link href={`/users/${encodeURIComponent(record.id)}`}>
                        <Button icon={<IconPencilMinus />} title="Edit User">Edit</Button>
                    </Link>

                    <Button icon={<IconTrash />} danger title="Delete User" onClick={() => showDeleteConfirm(record.id)}>
                    </Button>
                </Space.Compact>
            ),
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Users Management"
                extra={[
                    <Link href="/users/create" key={1}>
                        <Button type="primary"  icon={<IconPlus/>}>Add new</Button>
                    </Link>,
                ]}
            >
            </PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            fetchData={handleTableChange}
                            columns={tableColumns}
                            rowKey={(record) => record.username}
                            watchStates={[reload]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
