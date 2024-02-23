import React, { useState, useRef } from "react";
import Link from "next/link";
import UserPermissions from "@/policy/ability";
import { getAllSalesPricelist, deleteSalePricelist, toggleSalesPricelist } from "@/api/sales/pricelist";
import PageActions from "@/shared/components/page-actions";
import { Modal, Space, Row, Col, Button, message, Tag } from "antd";
const { confirm } = Modal;
import { IconEye, IconList, IconCopy, IconPlus, IconTrash, IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { IconAlertCircle } from "@tabler/icons-react";
import _ from "lodash";
import ModalClone from "@/shared/sales/modal-clone";
import { parseYesNo } from "@/hooks/formatter";
import ModalChangePrices from "@/shared/sales/modal-change-prices";
import { IconReceiptRefund } from "@tabler/icons-react";

const Index = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("sales_price_lists.manage")) {
        return false;
    }
	const [reload, setReload] = useState(0);
	const [popup, setPopup] = useState(false);
	const [popupChangePrices, setPopupChangePrices] = useState(false);
	const [loadingAction, setLoadingAction] = useState([]);
    const [selected, setSelected] = useState(null);

	// Modal Clone
    const togglePopup = (record) => {
        if (record) {
            setSelected(record);
        } else {
            setSelected(null);
        }
        setPopup(!popup);
    }; 
	// Modal Change Prices   
	const togglePopupChangePrices = (record) => {
        if (record) {
            setSelected(record);
        } else {
            setSelected(null);
        }
        setPopupChangePrices(!popupChangePrices);
    };

    // Delete action
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
                setLoadingAction(['delete', id]);
                const { data, error, validationErrors } = await deleteSalePricelist(id);
                if (error || validationErrors) {
                    message.error(error.response.data.message);
                } else {
                    message.success(`Pricelist deleted successfully`);
                    // Reload all
                    setReload(reload + 1);
                }
                setLoadingAction([]);
            },
        });
    };

    // Toggle Row state
    const toggleRow = async (idRow, isDisabled) => {
        setLoadingAction(['toggle', idRow]);
        var { status, error, errorMsg } = await toggleSalesPricelist(idRow, {
            disable: !isDisabled,
        });
        if (error) {
            message.error(errorMsg);
        } else {
            message.success("Changes saved succesfully");
            setReload(reload + 1);
        }
        setLoadingAction([]);
    };

    const handleTableChange = async (params) => {
        const result = await getAllSalesPricelist(params);
        return result.data;
    };

    const tableColumns = [
        {
            title: "Code",
            key: "code",
            dataIndex: "code"
        },
        {
            title: "Business Partner",
            key: "bp_desc",
            dataIndex: "bp_desc"
        },
        {
            title: "Currency",
            key: "currency_id",
            sorter: false,
        },
        {
            title: "Disabled",
            key: "is_disabled",
            sorter: false,
            type: "bool",
            render: ({is_disabled}) => <Tag color={is_disabled ? "red" : "green"}>{parseYesNo(is_disabled)}</Tag>
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) =>
                record.id === null ? null : (
                    <Space.Compact>
                        <Link key={0} title="Show" href={`/sales/sales-pricelist/${record.id}`}>
                            <Button icon={<IconEye />}>Show</Button>
                        </Link>
                        <Link key={1} title="Show Rows" href={`/sales/sales-pricelist/${record.id}/rows`}>
                            <Button icon={<IconList />}>Rows</Button>
                        </Link>
                        <Button key={2} icon={<IconCopy />} title="Duplicate" onClick={() => togglePopup(record)} />
                        <Button
							key={3}
							icon={<IconReceiptRefund />}
							title="Change Prices"
							onClick={() => togglePopupChangePrices(record)}
						/>
                        <Button
                            key={4}
                            icon={record.is_disabled ? <IconPlayerPlay color="#33855c" /> : <IconPlayerPause color="#333" />}
                            onClick={() => toggleRow(record.id, record.is_disabled)}
                            loading={_.isEqual(loadingAction, ['toggle', record.id])}
                        />
                        <Button key={5} icon={<IconTrash />} danger loading={_.isEqual(loadingAction, ['delete', record.id])} onClick={() => handleDeleteRow(record.id)} />
                    </Space.Compact>
                ),
        },
    ];

    return (
        <>
            {popup && <ModalClone isSale={true} opened={popup} data={selected} toggle={() => setPopup(!popup)} reload={() => setReload(reload + 1)} />}
            {popupChangePrices && <ModalChangePrices isSale={true} opened={popupChangePrices} data={selected} toggle={() => setPopupChangePrices(!popupChangePrices)} reload={() => setReload(reload + 1)}/>}
            <div className="page">
                <PageActions
                    title="Sales Pricelists"
                    extra={[
                        <Link href="/sales/sales-pricelist/create" key={0}>
                            <Button type="primary" icon={<IconPlus />}>
                                Add new
                            </Button>
                        </Link>,
                    ]}
                ></PageActions>

                <div className="page-content">
                    <Row>
                        <Col span={24}>
                            <Datatable fetchData={handleTableChange} columns={tableColumns} rowKey={(record) => record.id} watchStates={[reload]} />
                        </Col>
                    </Row>
                </div>
            </div>
        </>
    );
};

export default Index;
