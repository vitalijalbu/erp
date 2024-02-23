import React, { useEffect, useState } from 'react';
import { Button, Modal, message, Space, Skeleton, Table, Tag } from 'antd';
import { getLatestTransactions } from "@/api/transactions";
import Datatable from "@/shared/datatable/datatable";
import { DatatableController } from '@/shared/datatable/datatable';
import { printLabelsPdf } from "@/api/print";
import { useExport } from "@/hooks/download";
import { IconPrinter } from '@tabler/icons-react';


const LatestTransactions = ({ open, close }) => { 

    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const controller = new DatatableController();

    const tableColumns = [
        {
            title: "Trans Data",
            key: "data_exec",
            sorter: false,
            filterable: false,
            type: 'datetimetz'
        },
        {
            title: "Item",
            key: "item",
            sorter: false,
            filterable: false,
            copyable: true,
            width: '8%'
        },
        {
            title: "Desc",
            key: "item_desc",
            sorter: false,
            filterable: false
        },
        {
            title: "Lot",
            key: "IDlot",
            sorter: false,
            filterable: false
        },
        {
            title: "Warehouse",
            key: "whdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Location",
            key: "whldesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Sign",
            key: "segno",
            type: "bool",
            sorter: false,
            filterable: false,
            render: ({ segno }) => (
                <Tag color={segno === "+" ? "blue" : "red"}>
                  {segno}
                </Tag>
              ),
        },
        {
            title: "Trans. Type",
            key: "trdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            align: "right",
            width: "8%",
            key: "qty",
            type: 'qty',
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Dimensions",
            key: "dimensions",
            sorter: false,
            filterable: false
        },
        {
            title: "Business partner",
            key: "bpdesc",
            sorter: false,
            filterable: false
        },
        {
            title: "Order reference",
            key: "ord_rif",
            sorter: false,
            filterable: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (record, text, index) => (
                <Button 
                    onClick={() => printLabel(record, index) }
                    loading={loadingAction === index}
                    icon={<IconPrinter/>}
                >Label</Button>
            )
        }
    ];

    const printLabel = async (record, index) => {
        setLoadingAction(index);
        const {data, error} = await printLabelsPdf([record.IDlot]);
        if(!error) {
            useExport(data, `label_${record.IDlot}.pdf`);
        }
        else {
            message.error("Error during label pdf generation");
        }
        setLoadingAction(null);
    }

    const handleTableChange = async () => {
        if(open) {
            const {data, error} = await getLatestTransactions();
            if(!error) {
                return {data: data};
            }
            message.error("Error during latest transactions fetching");
        }
        return [];
    };

    useEffect(() => {
        if(open) {
            controller.refresh();
        }
    }, [open])

    return (
        <Modal 
            footer={[]} 
            title="Latest transactions" 
            transitionName="ant-modal-slide-up"
            open={open} 
            onCancel={() => close()}
            width="90%"
            className="modal-fullscreen"
            centered
        >
            <Datatable
                fetchData={handleTableChange}
                columns={tableColumns}
                controller={controller}
                rowKey={(record) => JSON.stringify(record)}
                pagination={false}
            />
        </Modal>
    );
}

export default LatestTransactions;