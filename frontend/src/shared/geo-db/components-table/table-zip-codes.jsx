import React, { useCallback, useEffect, useMemo, useState } from "react";
import Datatable from "@/shared/datatable/datatable";
import { getAllZipCodes, deleteZipCode } from "@/api/geo/zip-codes";
import ModalZipCode from "../modals/modal-zip-code";
import PageActions from "@/shared/components/page-actions";
import {
    Space,
    Button,
    Modal,
    message,
} from "antd";
const { confirm } = Modal;
import {
    IconTrash,
    IconAlertCircle,
    IconPlus,
    IconArrowRight,
    IconPencilMinus,
    IconX,
} from "@tabler/icons-react";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableZipCodes = ({
    onSelect,
    selectable,
    showArrow,
    city,
    filter,
    selectedData,
    openInModal
}) => {
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(null); //state to know which one is selected
    const [selectedEdit, setSelectedEdit] = useState(null); //state to know which one needs to be edited
    const [reload, setReload] = useState(0);
    const [popupZipCode, setPopupZipCode] = useState(null);
    const [presetFilters, setPresetFilters] = useState({});
    const [zipCodeIds, setZipCodeIds] = useState(null);
    const [staticData, setStaticData] = useState([]);

    const toggleZipCodePopup = (record) => {
        if (record) {
            setSelectedEdit(record);
        }
        setPopupZipCode(!popupZipCode);
    };


    const memoFilters = useMemo(() => presetFilters, [presetFilters]);


    useEffect(() => {
        setPresetFilters(!_.isEmpty(city) ? { city: { value: city.name, operator: "=" } } : {});
    }, [city]);

    useEffect(() => {
        if (selectedData) {
            setZipCodeIds(selectedData);
            setSelected(selectedData);
        }
    }, []);

    const handleModalSave = (value) => {
        if (value) {
            setZipCodeIds(value?.id)
            setSelected(value?.id)
            //onSelect(value?.id);
        }
        setReload(reload + 1);
    }
      
    // Construct the filters and attach to params of datatable
    const handleTableChange = async (filters) => {
        setLoading(true);
        const result = await getAllZipCodes(_.merge(filters, filter));
        //set static data for tag selection check
        setStaticData(result.data?.data);

        setLoading(false);
        return result.data;
    };


    const handleDeleteRow = async (id) => {
        confirm({
            title: "Confirm delete?",
            icon: <IconAlertCircle color={"#faad14"} size="20" className="anticon"/>,
            transitionName: "ant-modal-slide-up",
            content: "Continue with delete",
            okText: "Continue",
            okType: "danger",
            cancelText: "Cancel",
            async onOk() {
                setLoading(id);
                const { data, error, validationErrors } = await deleteZipCode(id);
                if (error || validationErrors) {
                    message.error(error.response.data?.message);
                    setLoading(false);
                } else {
                    message.success(`ZIP Code #${id} successfully deleted`);
                    // Reload all
                    setReload(reload + 1);
                }
                setLoading(false);
            },
        });
    };

    const tableColumns = [
        {
            title: "Code",
            key: "code",
            render: (text, record) => (
                // <Button type="text" onClick={() => onSelect(record)}>{record?.code}</Button>
                <Button type="text">{record?.code}</Button>
            )
        },
        {
            title: "Description",
            key: "description",
        },
        {
            title: "City",
            dataIndex: 'city',
            key: "city",
            filterable: filter ? false : true,
            render: (city) => (<span>{city.name}</span>)
        },
        {
            title: "Province",
            dataIndex: 'province',
            key: "province",
            filterable: filter ? false : true,
            render: (province) => (<span>{province?.code}</span>)
        },
        {
            title: "Nation",
            dataIndex: 'nation',
            key: "nation",
            filterable: filter ? false : true,
            render: (nation) => (<span>{nation.id}</span>)
        },
        {
            title: "Actions",
            key: "actions",
            align: "right",
            className: "table-actions",
            render: (text, record) => (
                <Space.Compact>
                    {showArrow && (
                        <Button
                            onClick={() => onSelect(record)}
                            icon={<IconArrowRight />}
                        />
                    )}
                    <Button
                        onClick={() => toggleZipCodePopup(record)}
                        icon={<IconPencilMinus />}
                    >
                        Edit
                    </Button>
                    <Button
                        danger
                        onClick={() => handleDeleteRow(record.id)}
                        icon={<IconTrash />} />
                </Space.Compact>
            ),
        },
    ];

    return (
        <>
            {popupZipCode && (
                <ModalZipCode
                    opened={popupZipCode}
                    toggle={toggleZipCodePopup}
                    data={selectedEdit}
                    reload={() => {
                        setReload(reload + 1);
                        //setSelected(selected);
                    }}
                    onSave={(value) => handleModalSave(value)}
                />
            )}
            <PageActions
                title={openInModal ? <TagSelection
                    data={staticData}
                    selected={selected}
                    displayField="name"
                    callback={() =>
                      getAllZipCodes({
                        columns: {
                          id: { search: { value: selected, operator: "=" } },
                        },
                      })
                    }
                   /> : "ZIP Codes"}
                extra={[
                    openInModal ? (
                        <Button
                            key={0}
                            disabled={!selectedData}
                            icon={<IconX color="#e20004" />}
                            onClick={() => {
                                setZipCodeIds(null);
                                onSelect(null);
                            }}
                        >
                            Remove current selection
                        </Button>
                    ) : null,
                    <Button
                        key={1}
                        icon={<IconPlus />}
                        type="primary"
                        onClick={() => toggleZipCodePopup()}
                    >
                        Add new
                    </Button>
                ]}
            />
            <div className="page-content">
                <Datatable
                    columns={tableColumns}
                    fetchData={handleTableChange}
                    rowKey="id"
                    watchStates={[reload, city]}
                    presetFilters={memoFilters}
                    loading={loading}
                    rowSelection={
                        selectable
                            ? {
                                type: "radio",
                                onChange: (selectedRowKeys, selectedRows) => {
                                    setZipCodeIds(selectedRows[0].id)
                                    onSelect(selectedRows[0].id);
                                },
                                selectedRowKeys: [zipCodeIds],
                            }
                            : false
                    }
                />
            </div>
        </>
    );
};

export default TableZipCodes;
