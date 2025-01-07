import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Modal, message } from "antd";
const { confirm } = Modal;
import FormContact from "@/shared/contacts/form-body";
import { deleteContact, getContactById } from "@/api/contacts";
import { IconTrash } from "@tabler/icons-react";



const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("bp.management")) {
        return false;
    }

  const router = useRouter();
  const { id } = router.query
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(1);
  const [data, setData] = useState(null);
  const [isFormChanged, setIsFormChanged] = useState(false);

  useEffect(() => {
    if (router.isReady && id) {
      setLoading(true);
      getContactById(id)
      .then((response) => {
          if (response.data) {
            setData(response.data);
          }
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [router.isReady, id, reload]);


        // Delete action
        const handleDelete = async () => {
          confirm({
          title: "Confirm Deletion",
          transitionName: "ant-modal-slide-up",
          content: "Are you sure you want to delete this contact?",
          okText: "Delete",
          okType: "danger",
          cancelText: "Cancel",
          async onOk() {
              try {
                  setLoading(true);
                  const { data, error } = await deleteContact(id);
                  if (error) {
                      message.error("Error deleting the contact");
                  } else {
                      message.success("Contact deleted successfully");
                      router.push('/contacts');
                  }
                  } catch (error) {
                  message.error("An error occurred while deleting the contact");
                  }
                  setLoading(false);
          },
          });
      };
    return (
        <div className="page">
            <PageActions
              loading={loading}
                backUrl="/contacts"
                title={<> Edit Contact - <mark>{data?.name}</mark></>}
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
                    </Button>,
                     <Button danger icon={<IconTrash />} onClick={() => handleDelete()} key={'delete'}>Delete</Button>
                ]}
            />
            <div className="page-content">
        <Card loading={loading} title="Contact details"> 
            <FormContact isModal={false} onLoading={(value) => setLoading(value)} data={data} reload={() => setReload(reload + 1)} changesWatcher={(value) => setIsFormChanged(value)}/>
        </Card>
        </div>
        </div>
    );
};

export default Index;
