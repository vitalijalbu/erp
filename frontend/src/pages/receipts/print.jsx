import React, { useState, useEffect, useCallback } from "react";
import UserPermissions from "@/policy/ability";
import { getLotTrackingReport, exportReportsTracking } from "@/api/reports/lots";
import { Alert, Space, Row, Col, Form, Input, Button, message } from "antd";
import PageActions from "@/shared/components/page-actions";
import { useValidationErrors } from "@/hooks/validation-errors";
import { printLabelRange } from "@/api/receipts";
import { useExport } from "@/hooks/download";

const printLabelRangePage = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("items_receipts.management")) {
    return false;
  }

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const validationErrorsBag = useValidationErrors();

  const printLabels = async () => {
    setLoading(true);
    validationErrorsBag.clear();
    const { data, error, validationErrors } = await printLabelRange(form.getFieldsValue());

    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
      }
      message.error(error?.response?.data?.message || "Error during labels print");
    } else {
      useExport(data, "labels.pdf");
    }
    setLoading(false);
  };

  return (
    <div className="page">
      <Alert
        message="Print Label Range"
        description={
          <ul>
            <li>
              You can select the labels to print selecting the lot range, for example from "ITBIFYXZ000" to
              "ITBIFYXZ000"
            </li>
            <li>
              You can select the labels to print selecting the delivery note, for example "123554" leaving empty the lot
              fields.
            </li>
            <li>You can also use the above mentioned methods together in order to restrict the selection..</li>
          </ul>
        }
        type="info"
        showIcon
      />
      <Form form={form} layout="inline" className="mt-3">
        <Space direction="horizontal" style={{ alignItems: "flex-start" }}>
          <Form.Item name="fromLot" {...validationErrorsBag.getInputErrors("fromLot")}>
            <Input placeholder="From Lot"></Input>
          </Form.Item>
          <Form.Item name="toLot" {...validationErrorsBag.getInputErrors("toLot")}>
            <Input placeholder="To Lot"></Input>
          </Form.Item>
          <Form.Item name="deliveryNote" {...validationErrorsBag.getInputErrors("deliveryNote")}>
            <Input placeholder="Delivery note(receipts)"></Input>
          </Form.Item>
          <Button type="primary" loading={loading} onClick={() => printLabels()}>
            Print Selected Labels
          </Button>
        </Space>
      </Form>
    </div>
  );
};

export default printLabelRangePage;
