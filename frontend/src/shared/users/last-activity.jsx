import React, { useState, useEffect } from "react";
import { Row, Col, Tag, Modal, Table, Tabs, Flex } from "antd";
import { dateTimeFormatter } from "@/hooks/formatter";
import { IconClock } from "@tabler/icons-react";
import _ from "lodash";

const LastActivity = (props) => {
    const { data } = props;

    const [lastModificationObject, setLastModificationObject] = useState(null);
    const [creationObject, setCreationObject] = useState(null);
    const [popup, setPopup] = useState(false);

    useEffect(() => {
        const extractData = (data) => data?.model || data?.relations?.roles;

        setLastModificationObject(extractData(data?.last_modification));
        setCreationObject(extractData(data?.creation));
    }, [data]);

    return (
        <>
            {popup && <PopupView opened={popup} toggle={() => setPopup(!popup)} data={data} title={props.title} />}
            {(creationObject || lastModificationObject) && (
                <Tag onClick={() => setPopup(!popup)} style={{ textAlign: "left", lineHeight: "14px", margin: "3px 0px", cursor: "pointer" }}>
                <Flex align="center">
                    <IconClock />
                    <div>
                    {creationObject && (
                        <span style={{ display: "block" }}>
                        Created by <mark>{creationObject.causer?.username}</mark> at {dateTimeFormatter(creationObject.time)}
                        </span>
                    )}
                    {lastModificationObject && (
                        <span style={{ display: "block" }}>
                        Last updated by <mark>{lastModificationObject.causer?.username}</mark> at{" "}
                        {dateTimeFormatter(lastModificationObject.time)}
                        </span>
                    )}
                    </div>
                </Flex>
                </Tag>
            )}
        </>
    );
};

const PopupView = (props) => {
    const { opened, toggle, data, title } = props;
    const [activeTab, setActiveTab] = useState(1);
    const [tableData, setTableData] = useState([]);

    const arrayDataUpdate = _.merge(
        {},
        _.get(data?.last_modification, "model.changes", {}),
        _.get(data?.last_modification, "relations.roles[0].changes", {}),
    );

    const arrayDataCreate = _.merge(
        {},
        _.get(data?.creation, "model.changes", {}),
        _.get(data?.creation, "relations.roles[0].changes", {}),
    );

    useEffect(() => {
        // Define which data source to use based on the active tab
        const combinedData = activeTab === 1 ? arrayDataUpdate : arrayDataCreate;

        // Transform the combined data into table data format
        const transformedData = _.chain(combinedData)
            .map((value, field) => ({
                key: field,
                field,
                old: value?.old,
                new: value?.new,
            }))
            .filter(
                (record) =>
                    !((_.isNil(record.old) && _.isNil(record.new)) || (_.isObject(record.old) && _.isEqual(record.old, record.new))),
            )
            .value();

        // Set the transformed data to the tableData state
        setTableData(transformedData);
        console.log("changed-tab", transformedData);
    }, [activeTab]);

    const renderData = (data) => {
        if (_.isNil(data)) {
            return " - ";
        }

        switch (typeof data) {
            case "object":
                if (_.isArray(data)) {
                    return data.map((item, index) => <span key={index}>{renderData(item)}</span>);
                } else {
                    const objectProperties = Object.entries(data).map(([key, value]) => (
                        <div key={key}>
                            <strong>{key}:</strong> {renderData(value)}
                        </div>
                    ));

                    return <div>{objectProperties}</div>;
                }
            case "boolean":
                return data ? "True" : "False";
            default:
                return data;
        }
    };

    const renderColumnValues = (value, otherValue) => {
        if (
            (_.isObject(value) && _.isNil(otherValue)) ||
            _.isObject(otherValue) ||
            (_.isObject(otherValue) && _.isNil(value)) ||
            _.isObject(value)
        ) {
            return null;
        } else if (_.isNil(value) || (_.isNil(value) && _.isNil(otherValue))) {
            return "-";
        } else {
            return renderData(value);
        }
    };

    const tableColumns = [
        {
            title: "Change",
            dataIndex: "field",
            key: "field",
        },
        {
            title: "Before",
            dataIndex: "old",
            key: "before",
            render: (before, record) => <>{renderColumnValues(before, record.new)}</>,
        },
        {
            title: "After",
            dataIndex: "new",
            key: "after",
            render: (after, record) => <>{renderColumnValues(after, record.old)}</>,
        },
    ];

    const expandRow = (record) => (_.isObject(record.old) && !_.isNil(record.old)) || (_.isObject(record.new) && !_.isNil(record.new));

    // Define tabs
    const itemTabs = [
        {
            key: 1,
            label: "Updates",
        },
        {
            key: 2,
            label: "Creation",
        },
    ];

    return (
        <Modal
            open={opened}
            title={
                data ? (
                    <>
                        Latest activity - <mark>{title}</mark>
                    </>
                ) : null
            }
            width="60%"
            transitionName="ant-modal-slide-up"
            className="modal-fullscreen"
            centered
            footer={false}
            onCancel={toggle}
            destroyOnClose={true}
        >
            <Tabs items={itemTabs} defaultActiveKey={activeTab} onChange={(key) => setActiveTab(key)} />
            <Table
                dataSource={tableData}
                columns={tableColumns}
                pagination={{ hideOnSinglePage: true, pageSize: 50 }}
                expandable={{
                    expandedRowRender: (record) => {
                        if (expandRow(record)) {
                            const { field, old, new: newChange } = record;
                            return (
                                <span key={field}>
                                    <Row>
                                        <Col span={12} style={{ paddingLeft: "30px" }}>
                                            <strong>
                                                <h3>Before</h3>
                                            </strong>
                                            {old !== null ? renderData(old) : " - "}
                                        </Col>
                                        <Col span={12} style={{ paddingLeft: "30px" }}>
                                            <strong>
                                                <h3>After</h3>
                                            </strong>
                                            {newChange !== null ? renderData(newChange) : " - "}
                                        </Col>
                                    </Row>
                                </span>
                            );
                        }
                    },
                    rowExpandable: expandRow,
                }}
            />
        </Modal>
    );
};

export default LastActivity;
