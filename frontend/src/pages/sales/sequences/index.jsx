import React, { useState} from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllSalesSequences,  deleteSaleSequence } from "@/api/sales/sequences";
import PageActions from "@/shared/components/page-actions";
import {
    Modal,
    Space,
    Row,
    Col,
    message,
    Button,
} from "antd";
import {IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";

const { confirm } = Modal;

const Index = () => {
    const [reload, setReload] = useState(0);
  
  
    const handleDeleteRow = async (id) => {
        confirm({
          title: "Confirm delete?",
          icon: <IconAlertCircle color={"#faad14"} size="24" className="anticon" />,
          transitionName: "ant-modal-slide-up",
          content: "Continue with delete",
          okText: "Continue",
          okType: "danger",
          cancelText: "Cancel",
          async onOk() {
            setLoadingAction(id);
            const { data, error, validationErrors } = await deleteSaleSequence(id);
            if (error || validationErrors) {
                message.error(error.response.data.message);
            } else {
                message.success(`Sales Sequences deleted successfully`);
                // Reload all
                setReload(reload + 1);
            }
            setLoadingAction(null);
         },
        });
      };


   
    const [loadingAction, setLoadingAction] = useState(null);
    //Set page permissions
    if (!UserPermissions.authorizePage("sale_sequences.manage")) {
        return false;
    }
    const handleTableChange = async (params) => {
        const result = await getAllSalesSequences(params);
        return result.data;
    };



    const tableColumns = [
        {
            title: "Name",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "Prefix",
            key: "prefix",
            sorter: false,

        },
     
      
        {
			title: "Quotation Default",
			key: "quotation_default",
            sorter: false,
            type: 'bool',

                    },
                    {
                        title: "Sale Default",
                        key: "sale_default",
                        sorter: false,
                        type: 'bool',
                    },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) =>
              record.id === null ? null 
              :(
                <Space.Compact>
                    <Link title="Edit sales sequence" href={`/sales/sequences/${record.id}`}>
                        <Button icon={<IconPencilMinus />}>Edit</Button>
                    </Link>                  <Button
                    icon={<IconTrash />}
                    danger
                    onClick={() => handleDeleteRow(record.id)}
                  />
                </Space.Compact>
              ),
          },

    ];

    return (
        <div className="page">
            <PageActions
                title="Sales Sequences"
                extra={[<Link href="/sales/sequences/create" key="1">
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
