import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import PageActions from "@/shared/components/page-actions";
import { Button, Card, Modal, message } from "antd";
const { confirm } = Modal;
import FormBody from "@/shared/sales/sequences/form-sales-sequence";
import { getSaleSequence,deleteSaleSequence} from "@/api/sales/sequences";
import { IconTrash } from "@tabler/icons-react";



const Index = () => {
    //Set page permissions
     if (!UserPermissions.authorizePage("sale_sequences.manage")) {
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
      getSaleSequence(id)
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
          console.log('sto cancellando')
          confirm({
          title: "Confirm Deletion",
          transitionName: "ant-modal-slide-up",
          content: "Are you sure you want to delete this sales sequence?",
          okText: "Delete",
          okType: "danger",
          cancelText: "Cancel",
          async onOk() {
              try {
                console.log('try on ok')
                  setLoading(true);
                  const { data, error } = await deleteSaleSequence(id);
                  if (error) {
                      message.error("Error deleting the sales sequence");
                  } else {
                      message.success("Sales sequence deleted successfully");
                      router.push('/sales/sequences');
                  }
                  } catch (error) {
                    console.log(error)
                  message.error("An error occurred while deleting the sales sequence");
                  }
                  setLoading(false);
          },
          });
      };
    return (
        <div className="page">
            <PageActions
              loading={loading}
                backUrl="/sales/sequences"
                title={<> Edit Sales Sequence - <mark>{id}</mark></>}
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
                     <Button danger icon={<IconTrash />} onClick={() => handleDelete()}>Delete</Button>
                ]}
            />
        <Card loading={loading} title="Sales Sequence Details"> 
            <FormBody isModal={false} onLoading={(value) => setLoading(value)} data={data} reload={() => setReload(reload + 1)} changesWatcher={(value) => setIsFormChanged(value)}/>
        </Card>
        </div>
    );
};

export default Index;
