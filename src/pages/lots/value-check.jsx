import React, { useState, useEffect } from "react";
import { useValidationErrors } from "@/hooks/validation-errors";
import UserPermissions from "@/policy/ability";
import { getLotValues, updateLotValue, updateBulkLotValues } from "@/api/lots";
import {
    Form,
    Input,
    Space,
    Row,
    Col,
    Button,
    Modal,
    Alert,
    InputNumber,
    message,
    Tooltip,
    Typography
} from "antd";
const { confirm } = Modal;
const { Text } = Typography;
import PageActions from "@/shared/components/page-actions";

import { IconCheckbox, IconCircle } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";

const ValueCheck = () => {
    //Set page permissions
    if (!UserPermissions.authorizePage("items_value.management")) {
      return false;
    }

    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [loadingAction, setLoadingAction] = useState(null);
    const [reload, setReload] = useState(0);
    const [lots, setLots] = useState({});
    const validationErrorsBag = useValidationErrors();

  // Datatable handle change
    const handleTableChange = async (params) => {
        const {data, error} = await getLotValues(params);
        const updatedLots = {};
        data.data.forEach((item) => {
            updatedLots[item.id_lot] = 0;
        });
        setLots(updatedLots);
        if(error) {
            message.error("Error during lots value data loading")
        }
        return data;
    };

    const handleUpdate = async (id, value) => {
        validationErrorsBag.clear();
        setLoadingAction(id);
        const updatedValue = value === null ? lots[id] : value;
        const { status, error, validationErrors } = await updateLotValue(id, {value: updatedValue});
        if (error) {
            if (validationErrors) {
                validationErrorsBag.setValidationErrors(validationErrors);
                setLoadingAction(null);
            }
            message.error("Error during saving operation");
        } else {
            message.success("Lot updated succesfully");
            setLoadingAction(null);
            setReload(reload + 1); // Call the callback to reload data
        }   
    };


    const handleFieldChange = (changedValues, allValues) => {
        const { idLot, value } = allValues;
        const updatedLots = lots;
        updatedLots[idLot] = value;
        setLots(updatedLots);
    };
  
  

    const handleConfirm = () => {
        confirm({ 
            title: 'Continue with bulk confirmation?',
            content: 'All values different from zero will be updated',
            transitionName:"ant-modal-slide-up",
            async onOk() {
                setLoadingAction(true);

                const filteredLots = {};
                for(let idLot in lots) {
                    if(lots[idLot] > 0) {
                        filteredLots[idLot] = lots[idLot];
                    }
                }

                if(!Object.keys(filteredLots).length) {
                    message.error("No lots to update");
                    return;
                }
            
                const {status, error} = await updateBulkLotValues({ lots: filteredLots });
                if(!error) {
                    message.success("Lots updated succesfully");
                    setReload(reload + 1); // Call the callback to reload data
                }
                else {
                    message.error(error?.response?.data?.message || "Error during lots updating");
                }
                setLoading(false);
            }
        });
    }


    const tableColumns = [
        {
            title: "Lot",
            key: "id_lot",
            fixed: "left",
            copyable: true,
            sorter: false
        },
        {
            title: "Item",
            key: "id_item",
            copyable: true,
            fixed: 'left',
            sorter: false
        },
        {
            title: "Description",
            key: "item_desc",
            sorter: false,
        },  
        {
            title: "Lot supplier",
            key: "id_lot_supplier",
            sorter: false
        },      
        {
            title: "B. Partner",
            description: "Business Partner",
            sorter: false,
            key: "bp_desc",
            ellipsis: true
        },     
        {
            title: "LWH",
            description: "Loaded Warehouse",
            sorter: false,
            key: "loaded_wh_desc",
        },      
        {
            title: "Delivery note",
            key: "delivery_note",
            sorter: false,
            render: ({delivery_note}) => (<Text>{delivery_note}</Text>)
        },  
        {
            title: "Cfg",
            description: "Configured Item",
            key: "conf_item",
            type: "bool",
            sorter: false
        },
        {
            title: "W",
            description: "Width (mm)",
            key: "la",
            type: "number",
            sorter: false,
            filterable: false
        },  
        {
            title: "L",
            description: "Lenght (mm)",
            key: "lu",
            type: "number",
            sorter: false,
            filterable: false
        }, 
        {
            title: "P",
            description: "Pieces",
            key: "pz",
            type: "number",
            sorter: false,
            filterable: false
        },
        {
            title: "E",
            description: "Exernal diameter (mm)",
            key: "de",
            type: "number",
            sorter: false,
            filterable: false
        },
        {
            title: "I",
            description: "Internal diameter (mm)",
            key: "di",
            type: "number",
            sorter: false,
            filterable: false
        },
        {
            title: "Ins. date",
            key: "date_ins",
            type: 'datetz',
            sorter: false,
            filterable: false
        },
        {
            title: "Lot date",
            key: "date_lot",
            type: 'datetz',
            sorter: false,
            filterable: false
        },
        {
            title: "Ord. ref",
            description: "Order reference",
            key: "ord_rif",
            sorter: false,
            filterable: false
        },
        {
            title: "Prc. p",
            description: "Price per piece",
            key: "price_piece",
            type: "number",
            align: "right",
            sorter: false,
            filterable: false
        },  
        {
            title: "Tot. val",
            description: "Total value in stock",
            align: "right",
            key: "tval",
            type: "number",
            sorter: false,
            filterable: false
        },
        {
            title: "Qty",
            description: "Stock quantity",
            align: "right",
            key: "tot_stock",
            type: "qty",
            after: (record) => record.um,
            sorter: false,
            filterable: false
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            render: (record) => (
                <Form
                    onFinish={(values) => handleUpdate("submit", values)}
                    onValuesChange={handleFieldChange}
                    name={`update-value-${record.id_lot}`}
                    key={`update-value-${record.id_lot}`}
                    initialValues={{ idLot: record.id_lot, value: 0 }}
                >
                    <Space.Compact>
                    <Form.Item name="idLot" hidden>
                        <Input readOnly disabled />
                    </Form.Item>
                    
                    <Form.Item name="value">
                        <InputNumber style={{ width: "60px" }} min={0} />
                    </Form.Item>
                    
                        <Tooltip
                            title="Set value zero for this lot"
                        >
                            <Button
                                loading={loadingAction === record.id_lot}
                                className="btn-dark"
                                onClick={() => handleUpdate(record.id_lot, 0)}
                                icon={<IconCircle></IconCircle>}
                            ></Button>
                        </Tooltip>
                        <Tooltip
                            title="Set value only for this lot"
                        >
                            <Button
                                loading={loadingAction === record.id_lot}
                                type="primary"
                                icon={<IconCheckbox />}
                                onClick={() => handleUpdate(record.id_lot, null)}
                            />
                        </Tooltip>
                    
                    </Space.Compact>
                </Form>
            ),
        },
    ];

    return (
        <div className="page">
            <PageActions
                title="Lot value to check"
                extra={[
                    <Tooltip
                        key={0}
                        title="Confirm all compiled values different from zero"
                    >
                        <Button
                            key={0}
                            type="primary"
                            disabled={Object.keys(lots).length == 0}
                            icon={<IconCheckbox />}
                            loading={loading}
                            onClick={handleConfirm}
                        >
                            Confirm values
                        </Button>
                    </Tooltip>
                ]}
            />
            <Alert
                message="Info"
                className="mb-1"
                showIcon
                description={
                    <ul>
                        <li>
                            All lots with zero value will be skipped. To set a value to zero,
                            click on the black right button one by one.
                        </li>
                        <li>
                            To update the values, you have to fill in the required values
                            for each lot and then click on "Confirm values" at the bottom of the page.
                        </li>
                        <li>
                            Once you have filled in the values, avoid switching to other pages,
                            otherwise, the entered values will be lost.
                        </li>
                    </ul>
                }
            />
            <div className="page-content">
                <Row>
                    <Col span={24}>
                        <Datatable
                            style={{ whiteSpace: "pre" }}
                            columns={tableColumns}
                            fetchData={handleTableChange}
                            watchStates={[reload]}
                            rowKey="id_lot"
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ValueCheck;
