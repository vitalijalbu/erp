import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllContacts, createContact, deleteContact } from "@/api/contacts";
import PageActions from "@/shared/components/page-actions";
import {
    Modal,
    Space,
    Row,
    Col,
    message,
    Tag,
    Button,
} from "antd";
import { IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";

const { confirm } = Modal;

const Index = () => {
    const [reload, setReload] = useState(0);
    const [loadingAction, setLoadingAction] = useState(null);
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const handleTableChange = async (params) => {
        const result = await getAllContacts(params);
        return result.data;
    };

      // Delete action
    const handleDelete = async (id) => {
        confirm({
        title: "Confirm Deletion",
        transitionName: "ant-modal-slide-up",
        content: "Are you sure you want to delete this contact?",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        async onOk() {
            try {
                setLoadingAction(id);
                const { data, error } = await deleteContact(id);
                if (error) {
                    message.error("Error deleting the contact");
                } else {
                    message.success("Contact deleted successfully");
                    setReload(reload + 1);
                }
                } catch (error) {
                message.error("An error occurred while deleting the contact");
                }
                setLoadingAction(null);
        },
        });
    };


    const tableColumns = [
        {
            title: "Name",
            key: "name",
            dataIndex: "name",
            width: "15%"
        },
        {
            title: "Type",
            key: "type",
            sorter: false,
            render: ({type}) => <Tag color={type != "person" ? "blue" : "orange"}>{type}</Tag>,
            filterOptions: ([{label: "Person", value:"person"}, {label: "Business", value:"business"}])
        },
        {
            title: "Qualification",
            key: "qualification",
            sorter: false
        }, 
        {
            title: "Department",
            key: "department",
            sorter: false
        }, 
        {
            title: "Address",
            key: "full_address",
            sorter: false,
            render: (record) => <span>{record.full_address?.join(", ")}</span>,
          }, 
        {
            title: "Phone",
            key: "mobile_phone",
            sorter: false
        },        
        {
            title: "Office Phone",
            key: "office_phone",
            sorter: false
        },  
        {
            title: "E-mail",
            key: "email",
            sorter: false,
            render: ({email}) => (
                email &&
                <Tag>
                    {email}
                </Tag> 
        )
        }, 
        {
            title: "Language",
            key: "language",
            width: "5%",
            sorter: false,
            render: ({language}) => (
                <Tag>
                    {language.toUpperCase()}
                </Tag>
        )
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    <Link title="Edit BP" href={`/contacts/${record.id}`}>
                        <Button icon={<IconPencilMinus />}>Edit</Button>
                    </Link>
                    <Button danger icon={<IconTrash />} onClick={() => handleDelete(record.id)} loading={loadingAction === record.id}/>
                </Space.Compact>
            )
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Contacts"
                extra={[<Link href="/contacts/create" key="1">
                    <Button type="primary" icon={<IconPlus/>}>Add new</Button>
                </Link>]}
            >
            </PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            fetchData={handleTableChange}
                            columns={tableColumns}
                            rowKey={(record) => record.id}
                            watchStates={[reload]}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
