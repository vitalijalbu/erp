import React, { useEffect, useState } from "react";
import { getAllAddresses, getAddressById } from "@/api/addresses/addresses";
import PageActions from "@/shared/components/page-actions";
import ModalAddress from "@/shared/addresses/modal-address";
import TagSelection from "@/shared/components/tag-selection";
import { Button, Col, Row } from "antd";
import { IconPlus, IconX } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import _ from "lodash";

const AddressesTable = (props) => {
    const [popupAddress, setPopupAddress] = useState(null);

    // initialize selected to props.selectedData to avoid the null at the begining
    const [selected, setSelected] = useState(props.selectedData || null);

    const [reload, setReload] = useState(0);
    const [loading, setLoading] = useState(true);
    const [addressIds, setAddressIds] = useState([]);
    const [data, setData] = useState([]);
    const [row, setRow] = useState(null);
    console.log('selected', selected)

    // initialize boolean var to true so it wont display at the begining

    //   const removeSelection = async () => {
    //     setSelected(null);
    //     setAddressIds([]);
    //     props?.onSelect(null);
    //     props?.onTableRemove();
    // }

    const toggleAddressPopup = (record) => {
        if(record){
            setSelected(record);
        }
        setPopupAddress(!popupAddress);
    };

    useEffect(() => {
        if (props.selectedData) {
            setAddressIds([props.selectedData]);
            //handleAddressById(selected);
        }
    }, []);


    const handleModalSave = async (value) => {
        setLoading(true);
        setSelected(value?.id);
        props.onSelect(value?.id);
        console.log('value-from-modal', value)
        //add row
        if (value) {
            if (props.selection === "checkbox") {
                if (_.isArray(selected)) {
                    setSelected(_.concat(selected, [value]));
                    props.onSelect(_.concat(selected, [value]));
                } else {
                    setSelected([value]);
                    props.onSelect([value]);
                }
            } 
            setAddressIds([value?.id]);
            setReload(reload + 1);
        }
        setLoading(false);
    };

    // Construct the filters and attach to params of datatable
    const handleTableChange = async (filters) => {
        setLoading(true);
        const result = await getAllAddresses(_.merge(filters, props.filter));
        setLoading(false);
        setData(result.data?.data);
        return result.data;
    };

    // Define table columns
    const tableColumns = [
        {
            title: "Name",
            key: "name",
            dataIndex: "name"
        },
        {
            title: "Address",
            dataIndex: "Address",
            key: "address",
            sorter: false,
        },
        {
            title: "Street Number",
            dataIndex: "street_number",
            key: "street_number",
            sorter: false,
            render: (street_number) => street_number,
        },
        {
            title: "City",
            dataIndex: ["city", "name"],
            key: "city",
            sorter: false,
            render: (name) => name,
        },
        {
            title: "Zip code",
            dataIndex: ["zip", "code"],
            key: "zip",
            sorter: false,
            render: (code) => code,
        },
        {
            title: "Province",
            dataIndex: ["province", "name"],
            key: "province",
            sorter: false,
            render: (name) => name,
        },
        {
            title: "Nation",
            dataIndex: ["nation", "name"],
            key: "nation",
            sorter: false,
            render: (name) => name,
        },
        {
            title: "Time Zone",
            dataIndex: "timezone",
            key: "timezone",
            sorter: false,
        },
    ];

    return (
        <div className="page">
            {popupAddress && (
                <ModalAddress
                    opened={popupAddress}
                    toggle={toggleAddressPopup}
                    data={selected ?? null}
                    reload={() => {
                        setReload(reload + 1);
                        //setSelected(selected);
                    }}
                    onSave={(value) => handleModalSave(value)}
                />
            )}
            <PageActions
                loading={loading}
                title={<TagSelection 
                    selected={selected} 
                    data={data} 
                    displayField="name" 
                    callback={getAddressById}
                    canEdit={true}
                    onEdit={() => toggleAddressPopup(selected)}/>}
                extra={[
                    props.isModal && !props.isAssociation && (
                        <Button
                            key={2}
                            disabled={!props.selectedData}
                            icon={<IconX color="#e20004" />}
                            onClick={() => {
                                setAddressIds([]);
                                setSelected(null), setRow(null), setReload(reload + 1), props.onSelect(null);
                            }}
                        >
                            Remove current selection
                        </Button>
                    ),
                    <Button key={0} type="primary" icon={<IconPlus />} onClick={() => toggleAddressPopup()}>
                        Add new
                    </Button>,
                ]}
            />
            <div className="page-content">
                <Row>
                    <Col span={24} className="mb-3">
                        <Datatable
                            columns={tableColumns}
                            fetchData={handleTableChange}
                            rowKey="id"
                            loading={loading}
                            watchStates={[reload]}
                            rowSelection={
                                props.selectable
                                    ? {
                                          type: props.selection ?? "radio",
                                          fixed: true,
                                          preserveSelectedRowKeys: false,
                                          selectedRowKeys: addressIds,
                                          onChange: (selectedRowKeys, selectedRows) => {
                                              if (props.selection === "checkbox") {
                                                  props?.onSelect(selectedRows);
                                                  setAddressIds(_.map(selectedRows, "id"));
                                                  setRow(selectedRows[0]) // important for update button tagselection
                                                  setSelected(selectedRows);
                                              } else {
                                                  props?.onSelect(selectedRows[0].id);
                                                  setAddressIds([selectedRows[0].id]);
                                                  setRow(selectedRows[0]) // important for update button tagselection
                                                  setSelected(selectedRows[0].id);
                                              }
                                          },
                                      }
                                    : false
                            }
                        />
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default AddressesTable;
