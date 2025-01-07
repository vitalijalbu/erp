import React, { useState} from "react";
import UserPermissions from "@/policy/ability";
import { deleteBPGroup, getAllBPGroups } from "@/api/bp";
import PageActions from "@/shared/components/page-actions";
import {
    Space,
    Row,
    Col,
    Modal,
    Button,
    message
} from "antd";
const { confirm } = Modal;
import { IconTrash, IconPencilMinus, IconPlus } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalGroup from "@/shared/business-partners/modal-group";



const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }
    const [reload, setReload] = useState(0);
    const [loadingAction, setLoadingAction] = useState(null);
    const [popupGroup, setPopupGroup] = useState(false);
    const [selected, setSelected] = useState(null);
   

    const toggleGroupPopup = (record) => {
        if (record) {
          setSelected(record);
        } else {
          setSelected(null);
        }
        setPopupGroup(!popupGroup);
      };

    
    const handleTableChange = async (params) => {
        const result = await getAllBPGroups(params);
        return result.data;
    };


      // Delete action
      const handleDeleteRow = async (id) => {
        confirm({
        title: "Confirm Deletion",
        transitionName: "ant-modal-slide-up",
        content: "Are you sure you want to delete this group?",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        async onOk() {
            try {
                setLoadingAction(id);
                const { data, error } = await deleteBPGroup(id);
                if (error) {
                    message.error("Error deleting the group");
                } else {
                    message.success("Group deleted successfully");
                    setReload(reload + 1);
                }
                } catch (error) {
                message.error("An error occurred while deleting the group");
                }
                setLoadingAction(null);
        },
        });
    };


    const tableColumns = [
        {
            title: "Name",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                <Button icon={<IconPencilMinus />} onClick={() => toggleGroupPopup(record)}>Edit</Button>
                <Button
                  icon={<IconTrash />}
                  danger
                  loading={loadingAction === record.id}
                  onClick={() => handleDeleteRow(record.id)}
                />
              </Space.Compact>
            )
        }
    ];

    return (
        <>
        {popupGroup && (
          <ModalGroup
            opened={popupGroup}
            toggle={toggleGroupPopup}
            data={selected ?? null}
            reload={() => setReload(reload + 1)}
          />
        )}
        <div className="page">
            <PageActions
                title="Business Partners Groups"
                extra={[<Button key={0} type="primary" icon={<IconPlus/>} onClick={() => toggleGroupPopup()}>Add new</Button>]}
            >
            </PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            fetchData={handleTableChange}
                            columns={tableColumns}
                            watchStates={[reload]}
                            rowKey={(record) => record.id}
                        />
                    </Col>
                </Row>
            </div>
        </div>
        </>
    );
};

export default Index;
