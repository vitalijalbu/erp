import { getAllRoles, deleteRole } from "@/api/users";
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
import Toolbar from "@/shared/users/toolbar";
import { ExclamationCircleFilled } from '@ant-design/icons';
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

    const showDeleteConfirm = (roleId) => {
        confirm({
            title: 'Do you want to delete the role?',
            icon: <ExclamationCircleFilled color="#faad14" size="24" className="anticon"/>,
            transitionName: "ant-modal-slide-up",
            content: 'The role will be deleted permanently',
            okText: 'Delete',
            okType: 'danger',
            async onOk() {
                const { status } = await deleteRole(roleId);
                if (status) {
                    message.success("Role deleted successfully");
                }
                else {
                    message.error("Error during role deleting")
                }

                setReload(reload + 1);
            },
            onCancel() {

            },
        });
    };

    const handleTableChange = async (params) => {
        const result = await getAllRoles(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Code",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "Name",
            key: "label",
        },
        {
            title: "System Role",
            key: "system",
            type: 'bool'
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                record.system == 0 &&
                <Space.Compact>
                    <Link href={`/users/roles/${encodeURIComponent(record.id)}`}>
                        <Button icon={<IconPencilMinus />} title="Edit Role">Edit</Button>
                    </Link>

                    <Button icon={<IconTrash />} danger title="Delete Role" onClick={() => showDeleteConfirm(record.id)}>
                    </Button>
                </Space.Compact>
            ),
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Roles Management"
                extra={[
                    <Link href="/users/roles/create" key={1}>
                        <Button type="primary" icon={<IconPlus/>}>Add new</Button>
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
                            rowKey={(record) => record.name}
                            watchStates={[reload]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
