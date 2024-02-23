import React, { useState, useEffect } from "react";
import { testFunction } from "@/api/configurator/functions";
import { useValidationErrors } from "@/hooks/validation-errors";
import _ from "lodash";
import {
  Row,
  Button,
  Form,
  message,
  Input,
  Modal,
  Col,
  Tag,
  Space,
  Typography
} from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import { IconAlertCircle, IconPlayerPlay } from "@tabler/icons-react";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import JsonView from "@uiw/react-json-view";

const ModalFunctionTest = ({ opened, toggle, idFunction, argumentsData }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [localData, setLocalData] = useState(null);
  const [formChanged, setFormChanged] = useState(false);
  const validationErrorsBag = useValidationErrors();

  const [popUpWindow, setPopupWindow] = useState(null)
  useEffect(() => {
    if (window.popUpWindow) {
      setPopupWindow(window.popUpWindow)
    }
  }, [window.popUpWindow])


  //Save
  const handleSubmit = async (values) => {
    setLoading(true);
    const { data, error, validationErrors, status } = await testFunction(
      idFunction,
      values
    );
    console.log("Response", { data, error, validationErrors, status });


    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);

      }
      setLocalData({
        status: status,
        message: error?.response.data.execution?.debug.error.message,
      });
      message.error("Error during saving operation");


    } else {
      setLocalData({
        status: status,
        return: data.execution.return,
      });

    }

    setLoading(false);

  };

  //Close modal confirmation if form state is TRUE
  const handleExit = () => {
    if (formChanged === true) {
      confirm({
        title: "Confirm exit",
        icon: (
          <IconAlertCircle color={"#faad14"} size="24" className="anticon" />
        ),
        transitionName: "ant-modal-slide-up",
        // content: "Seems like you forgot to save your edits",
        okText: "Exit",
        okType: "danger",
        cancelText: "Cancel",
        onOk() {
          toggle();
          setFormChanged(false);
        },
      });
    } else {
      toggle();
    }
  };





  const renderArgumentInputs = () => {
    if (_.isEmpty(argumentsData)) return null;

    return argumentsData.map((argument, index) => (
      <Col lg={8} sm={12} md={8}>
        <Form.Item key={index} label={argument.name} name={argument.name}>
          <Input allowClear />
        </Form.Item>
      </Col>
    ));
  };

  return (
    <>
      <Modal
        open={opened}
        width="60%"
        destroyOnClose={true}
        onCancel={handleExit}
        title={
          <>
            Test Function- <mark>{idFunction}</mark>
          </>
        }
        centered
        maskClosable={false}
        transitionName="ant-modal-slide-up"
        footer={[
          <Button key={0} onClick={handleExit}>
            Close
          </Button>,
          <Button
            key={1}
            form="formTestFunction"
            type="primary"
            htmlType="submit"
            icon={<IconPlayerPlay />}
            loading={loading}
          >
            Run
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          disabled={loading}
          onFinish={handleSubmit}
          onValuesChange={() => setFormChanged(true)}
          name="formTestFunction"
        >
          <Row gutter={16}>
            {renderArgumentInputs()}
          </Row>


          {localData &&
            <Row gutter={16}>
              <Col span={24}>
                <Text>Response: {localData.status === 200 ? <CheckCircleOutlined color="green" /> : <CloseCircleOutlined color="red" />}</Text>
              </Col>
              <Col span={24} className="m-1">
                <pre
                  className={localData.status === 200 ? 'green' : 'red'}
                >
                  {localData.status}
                  <JsonView
                    value={_.omit(localData, 'status')}
                    displayDataTypes={false}
                    displayObjectSize={false}
                  />
                </pre>
              </Col>
            </Row>
          }
        </Form>
      </Modal>
    </>
  );
};

export default ModalFunctionTest;
