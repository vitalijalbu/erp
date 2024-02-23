import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import {
    getAllStocks,
    getAllStocksExport,
    createMaterialIssue,
    createMaterialTransfer,
    addLotToInventory,
    removeLotFromInventory
} from "@/api/stocks";
import {
    Row,
    Col,
    Space,
    Button,
    Modal,
    message,
    Typography,
    Tag,
    Tooltip
} from "antd";
const { confirm } = Modal;
import PageActions from "@/shared/components/page-actions";
import {
    IconScissorsOff,
    IconAlertCircle,
    IconPrinter,
    IconTransferIn,
    IconTruck,
    IconLayersIntersect,
    IconSettings,
    IconCircleCheck,
    IconCircleOff,
    IconList,
    IconPencilMinus
} from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import { DatatableController } from "@/shared/datatable/datatable";
import EditLotTextDreawer from "@/shared/stocks/edit-lot-text-drawer";
import { printLabelsPdf } from "@/api/print";
import { useExport } from "@/hooks/download";
import UserPermissions from "@/policy/ability";
import { Can } from "@/policy/ability";


const Index = () => {

    if (!UserPermissions.authorizePage("items_stocks.show")) {
        return false;
    }

    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [openEditLot, setOpenEditLot] = useState(false);
    const [currentEditLot, setCurrentEditLot] = useState(null);
    const router = useRouter();
    const pageUrl = router.asPath;

    localStorage.setItem('pageUrl', pageUrl);


    const dtController = new DatatableController();

    const currentInventory = useRef(null);

    const handleTableChange = async (params) => {
        const result = await getAllStocks(params);
        currentInventory.current = result.data.id_inventory;
        return result.data;
    };

    const exportData = async (params) => {
        const result = await getAllStocksExport(params);
        return [result.data, "stock-view.xlsx"];
    };

    //select rows from table
    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const printLabels = async () => {
        setLoadingAction('print');
        const { data, error } = await printLabelsPdf(selectedRowKeys);
        if (!error) {
            useExport(data, `cutting_labels.pdf`);
        }
        else {
            message.error("Error during cutting label pdf generation");
        }
        setLoadingAction(null);
    }

    const addToInventory = async (stock) => {
        setLoading(true);
        const { data, error } = await addLotToInventory(stock.id_lot, {
            id_warehouse: stock.warehouse_id,
            id_warehouse_location: stock.warehouse_location_id
        });
        if (!error) {
            message.success('Lot addedd to inventory successfullty');
        }
        else {
            message.error("Error during lot adding to inventory");
        }
        dtController.refreshCurrentPage();
        setLoading(false);
    }

    const removeFromInventory = async (stock) => {
        setLoading(true);
        const { data, error } = await removeLotFromInventory(stock.id_lot, {
            id_warehouse: stock.warehouse_id,
            id_warehouse_location: stock.warehouse_location_id
        });
        if (!error) {
            message.success('Lot removed from inventory successfullty');
        }
        else {
            message.error("Error during lot removing from inventory");
        }
        dtController.refreshCurrentPage();
        setLoading(false);
    }

    // Action Confirm Toolbar
    const handleToolbar = (type) => {
        confirm({
            title: `Confirm with material ${type}?`,
            icon: <IconAlertCircle color="#faad14" size="24" className="anticon" />,
            transitionName: "ant-modal-slide-up",
            content: `Continue with material ${type}`,
            okText: "Continue",
            cancelText: "Cancel",
            onCancel() {
                setLoadingAction(null);
            },
            async onOk() {
                setLoadingAction(type);
                try {
                    const actionApi = type === 'transfer' ? createMaterialTransfer : createMaterialIssue;
                    const actionText = type === 'transfer' ? 'Material transfer' : 'Material issue';
                    const response = await actionApi({ idStocks: selectedRowKeys });
                    //refresh table
                    setSelectedRowKeys([]);

                    if (response.status === 200) {
                        message.success(`${actionText} successfully created`);
                    }
                } catch (error) {
                    message.error(error.message);
                } finally {
                    setLoadingAction(null);
                }
            },
        });
    };



    const tableColumns = [
        {
            title: "Lot",
            description: "Lot ID",
            key: "id_lot",
            fixed: "left",
            copyable: true,
            ellipsis: false,
            sorter: false
        },
        {
            title: "Origin Lot",
            key: "id_lot_origine",
            copyable: true,
            sorter: false,
            fixed: 'left',
        },
        {
            title: "Item",
            description: "Item code",
            key: "item_code",
            hasFilterOperator: true,
            sorter: false,
            fixed: 'left',
            render: (value, record) => {
                return record.altv_code?.length ? <Tooltip title={record.altv_code}>{record.item_code}</Tooltip> : <>{record.item_code}</>
            }
        },
        {
            title: "Description",
            description: "Item description",
            key: "item_desc",
            hasFilterOperator: true,
            sorter: false,
            render: (value, record) => {
                return record.altv_desc?.length ? <Tooltip title={record.altv_desc}>{record.item_desc}</Tooltip> : <>{record.item_desc}</>
            }
        },
        {
            title: "WHS",
            description: "Warehouse",
            key: "warehouse",
            sorter: false
        },
        {
            title: "LOC",
            description: "Warehouse location",
            key: "warehouse_location",
            sorter: false,
            hasFilterOperator: true
        },
        {
            title: "W",
            description: "Width (mm)",
            key: "la",
            type: 'number',
            sorter: false,
            hasFilterOperator: true
        },
        {
            title: "L",
            description: "Lenght (mm)",
            key: "lu",
            type: 'number',
            hasFilterOperator: true
        },
        {
            title: "P",
            description: "Pieces",
            key: "pz",
            type: 'number',
            hasFilterOperator: true
        },
        {
            title: "E",
            description: "External diameter (mm)",
            key: "de",
            type: 'number',
            hasFilterOperator: true
        },
        {
            title: "I",
            description: "Internal diameter (mm)",
            key: "di",
            type: 'number',
            hasFilterOperator: true
        },
        {
            title: "Cuts",
            description: "Count of planned cuts",
            key: "cutNum",
            type: 'number',
            hasFilterOperator: true,
            render: (record) => record.cutNum > 0 ? <Tag color="red">{record.cutNum}</Tag> : <Typography.Text>{record.cutNum}</Typography.Text>
        },
        {
            title: "Qty",
            description: "Quantity um",
            key: "qty_stock",
            type: 'qty',
            after: (record) => record.item_um,
            hasFilterOperator: true
        },
        {
            title: "Lot date",
            key: "date_lot",
            type: 'datetz',
            sorter: false
        },
        {
            title: "Loy",
            description: "Lot origin year",
            key: "lot_ori_year",
            type: "number",
            hasFilterOperator: true
        },
        {
            title: "Sr",
            description: "Step roll",
            key: "step_roll",
            type: "bool",
            sorter: false,
        },
        {
            title: "E1",
            description: "Eur 1 lots",
            key: "eur1",
            type: "bool",
            sorter: false,
        },
        {
            title: "Cfg",
            description: "Configured item",
            key: "conf_item",
            type: "bool",
            sorter: false,
        },
        {
            title: "Mgr",
            description: "Merged lot",
            key: "merged_lot",
            type: "bool",
            sorter: false,
        },
        {
            title: "Ord. ref",
            description: "Order reference",
            key: "lot_ord_rif",
            dataIndex: "lot_ord_rif",
            sorter: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record) => (
                <Space.Compact>
                    {
                        record['item_um'] == 'm2' ?
                            (
                                <>
                                    <Can do="cutting_order.management">
                                        <Link title="Go to cutting manager" href={`/cutting/${record.id_lot}`}>
                                            <Button className={record['cutNum'] ? '' : 'btn-dark'} icon={<IconLayersIntersect />}>
                                            </Button>
                                        </Link>
                                    </Can>
                                    <Can do="production_order.management">
                                        <Link title="Go to production order" href={`/production/${record.id_lot}`}>
                                            <Button className={record['numComp'] ? '' : 'btn-dark'} icon={<IconSettings />}>
                                            </Button>
                                        </Link>
                                    </Can>
                                    {/*<Link title="Go to merge order" href={`/merge/${record.idStock}`}>
                                <Button className="btn-dark" icon={<IconLink />}>
                                </Button>
                            </Link>*/}
                                </>
                            ) :
                            (
                                <Can do="split_order.management">
                                    <Link title="Go to splitting order" href={`/splitting/${record.idStock}`}>
                                        <Button className="btn-dark" icon={<IconScissorsOff />}>
                                        </Button>
                                    </Link>
                                </Can>
                            )

                    }
                    <Can do="items.management">
                        <Tooltip title={record['note'] ? `Edit lot text: ${record['note']}` : "Edit lot text"}>
                            <Button
                                className={record['note'] ? '' : 'btn-dark'}
                                icon={<IconPencilMinus />}
                                onClick={() => {
                                    setCurrentEditLot(record);
                                    setOpenEditLot(true);
                                }}
                            >
                            </Button>
                        </Tooltip>
                    </Can>
                    {
                        currentInventory.current !== null && (
                            record['id_inventory'] ? (
                                <Can do="inventory.management">
                                    <Button
                                        loading={loading}
                                        title="Remove lot to inventory"
                                        danger
                                        icon={<IconCircleOff />}
                                        onClick={() => { removeFromInventory(record) }}
                                    >
                                    </Button>
                                </Can>
                            ) :
                                (
                                    <Can do="inventory.management">
                                        <Button
                                            loading={loading}
                                            className="btn-info"
                                            title="Add lot to inventory"
                                            icon={<IconCircleCheck />}
                                            onClick={() => { addToInventory(record) }}
                                        >
                                        </Button>
                                    </Can>
                                )
                        )
                    }
                    <Link title="Go to stock tracking" href={`/reports/lots/tracking?idLot=${encodeURIComponent(record.id_lot)}`}>
                        <Button className="btn-warning" icon={<IconList />}>
                        </Button>
                    </Link>
                </Space.Compact>
            ),
        },
    ];

    //const [test, setTest] = useState({});

    return (
        <div className="page">
            {openEditLot && <EditLotTextDreawer
                open={openEditLot}
                currentEditLot={currentEditLot}
                reload={() => dtController.refreshCurrentPage()}
                onClose={() => setOpenEditLot(false)}
            />}
            <PageActions
                title="Stocks view"
            >
                <Row>
                    <Col span={24}>
                        <Space.Compact block="true">
                            <Button type="default" loading={loadingAction === 'print'} disabled={!selectedRowKeys.length} icon={<IconPrinter />} onClick={() => printLabels()}>
                                Print Labels
                            </Button>
                            <Button type="default" loading={loadingAction === 'transfer'} disabled={!selectedRowKeys.length} icon={<IconTransferIn />} onClick={() => handleToolbar('transfer')}>
                                Transfer
                            </Button>
                            <Button type="default" loading={loadingAction === 'shipment'} disabled={!selectedRowKeys.length} icon={<IconTruck />} onClick={() => handleToolbar('shipment')}>
                                Shipment
                            </Button>
                        </Space.Compact>
                    </Col>
                </Row>
            </PageActions>

            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            controller={dtController}
                            id="stock-view-dt"
                            style={{ whiteSpace: 'pre' }}
                            rowSelection={{
                                selectedRowKeys,
                                onChange: onSelectChange,
                            }}
                            fetchData={handleTableChange}
                            exportData={exportData}
                            columns={tableColumns}
                            rowKey={(record) => record.idStock}
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default Index;
