import { useState } from "react";
import BomConstraint from "@/shared/configurator/bom-constraints/bom-constraint";
import { deleteConstraint } from "@/api/configurator/constraints";
import { message, Button } from "antd";
import PageActions from "@/shared/components/page-actions";
import { IconTrash } from "@tabler/icons-react";
import { SaveOutlined, SaveFilled } from "@ant-design/icons";

const PageBomConstraint = (props) => {

  const {
    id,
    title,
    backUrl,
    saveEnabled,
    deleteEnabled,
    onSave,
    onUpdate,
    onDelete
  } = props;

  const [isDraft, setIsDraft] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formChanged, setFormChanged] = useState(false);

  const [messageApi, contextHolder] = message.useMessage();

  // Delete action
  const handleSubmitDelete = async () => {
    confirm({
      title: "Confirm Deletion",
      transitionName: "ant-modal-slide-up",
      content: "Are you sure you want to delete this BOM constraint?",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          const { data, error } = await deleteConstraint(id);
          if (error) {
            messageApi.open({ type: 'error', content: deleteMessages.error });
          } else {
            messageApi.open({ type: 'success', content: deleteMessages.success });
          }
        } catch (error) {
          messageApi.open({ type: 'error', content: deleteMessages.error });
        }
      },
    });
  };

  return (
    <>
      {contextHolder}
      <PageActions
        backUrl={backUrl}
        title={title}
        extra={[
          (saveEnabled) ? <Button
            htmlType="submit"
            onClick={() => setIsDraft(false)}
            type="primary"
            form="form-constraint"
            loading={loading}
            key={0}
          >
            Save
          </Button> : <></>,
          (isDraft || !deleteEnabled) ? <Button
            htmlType="submit"
            onClick={() => setIsDraft(true)}
            icon={<SaveOutlined />}
            form="form-constraint"
            loading={loading}
            key={15}
          >
            Save as Draft
          </Button> : <></>,
          (deleteEnabled) ? <Button icon={<IconTrash />} danger onClick={handleSubmitDelete}>
            Delete
          </Button> : <></>
        ]}
      />
      <BomConstraint
        id={id}
        title={title}
        deleteEnabled={deleteEnabled}
        saveEnabled={saveEnabled}
        onSave={onSave}
        onUpdate={onUpdate}
        onDelete={onDelete}
        isDraft={isDraft}
        setIsDraft={setIsDraft}
        loading={loading}
        setLoading={setLoading}
        setFormChanged={setFormChanged}
      />
    </>
  );
}

export default PageBomConstraint;
