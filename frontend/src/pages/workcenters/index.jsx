import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import { getAllWorkcenters, deleteWorkcenter } from "@/api/workcenters";
import PageActions from "@/shared/components/page-actions";
import {
    Modal,
    Space,
    Row,
    Col,
    message,
    Button,
} from "antd";
const { confirm } = Modal;
import { IconPencilMinus, IconPlus, IconTrash } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import ModalWorkcenter from "@/shared/workcenters/modal-workcenter";



const Index = () => {
     //Set page permissions
     if (!UserPermissions.authorizePage("workcenters.manage")) {
        return false;
    }

    const [reload, setReload] = useState(0);
    const [loadingAction, setLoadingAction] = useState(null);
    const [popupWorkcenter, setPopupWorkcenter] = useState(false);
    const [selected, setSelected] = useState(null);
   

    const toggleWorkcenterPopup = (record) => {
        if (record) {
          setSelected(record);
        } else {
          setSelected(null);
        }
        setPopupWorkcenter(!popupWorkcenter);
      };


    const handleTableChange = async (params) => {
        const result = await getAllWorkcenters(params);
        return result.data;
    };

      // Delete action
    const handleDeleteRow = async (id) => {
        confirm({
        title: "Confirm Deletion",
        transitionName: "ant-modal-slide-up",
        content: "Are you sure you want to delete this workcenter?",
        okText: "Delete",
        okType: "danger",
        cancelText: "Cancel",
        async onOk() {
            try {
                setLoadingAction(id);
                const { data, error } = await deleteWorkcenter(id);
                if (error) {
                    message.error("Error deleting the workcenter");
                } else {
                    message.success("Workcenter deleted successfully");
                    setReload(reload + 1);
                }
                } catch (error) {
                message.error("An error occurred while deleting the workcenter");
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
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                <Button icon={<IconPencilMinus />} onClick={() => toggleWorkcenterPopup(record)}>Edit</Button>
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
        {popupWorkcenter && (
          <ModalWorkcenter
            opened={popupWorkcenter}
            toggle={toggleWorkcenterPopup}
            data={selected ?? null}
            reload={() => setReload(reload + 1)}
          />
        )}
        <div className="page">
            <PageActions
                title="Workcenters"
                extra={[
                    <Button key={0} type="primary" icon={<IconPlus/>} onClick={() => toggleWorkcenterPopup()}>Add new</Button>
                ]}
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
        </>
    );
};

export default Index;
