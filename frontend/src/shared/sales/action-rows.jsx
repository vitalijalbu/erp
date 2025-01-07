"use client";
import React from "react";
import {  Row, Col, Tooltip, Button, Typography } from "antd";
const { Title } = Typography;
import { IconPlus } from "@tabler/icons-react";
import { IconCirclePlus } from "@tabler/icons-react";


const ActionRows = ({loading, disabled, eventClick}) => {


  return (
    <div>
    <Title level={5}>Add new Row</Title>
    <Row gutter={[8, 8]}>
        <Col span={12}>
            <Tooltip title="To add rows, select BP first" key={`t-${0}`}>
                <Button
                    block
                    loading={loading}
                    disabled={disabled}
                    icon={<IconCirclePlus color="#fff" fill="#33855c"/>}
                    onClick={() => eventClick("item")}
                    key={0}
                >
                    New Item
                </Button>
            </Tooltip>
        </Col>
        <Col span={12}>
            <Tooltip title="To add rows, select BP first" key={`t-${1}`}>
                <Button
                    block
                    key={1}
                    disabled={disabled}
                    icon={<IconCirclePlus color="#fff" fill="#3f8af3" />}
                    onClick={() => eventClick("standard_product")}
                >
                    New Configurable Item
                </Button>
            </Tooltip>
        </Col>
    </Row>
</div>
  );
};

export default ActionRows;
