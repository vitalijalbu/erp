import React, { useEffect, useMemo, useState } from "react";
import Datatable from "@/shared/datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { getAllProvinces, deleteProvince } from "@/api/geo/provinces";
import ModalProvince from "../modals/modal-province";
import { Space, Button, Modal, message } from "antd";
const { confirm } = Modal;
import { IconTrash, IconAlertCircle, IconPlus, IconArrowRight, IconPencilMinus, IconX } from "@tabler/icons-react";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableProvinces = ({ onSelect, selectable, showArrow, nation, filter, selectedData, openInModal }) => {
  const [loading, setLoading] = useState(false);
  const [popupProvince, setPopupProvince] = useState(null);
  const [selected, setSelected] = useState(null); //state to know which one is selected
  const [selectedEdit, setSelectedEdit] = useState(null); //state to know which one needs to be edited
  const [reload, setReload] = useState(0);
  const [presetFilters, setPresetFilters] = useState({});
  const [provinceIds, setProvinceIds] = useState(null);
  const [row, setRow] = useState(null);
  const [staticData, setStaticData] = useState([]);


  const toggleProvincePopup = (record) => {
    if (record) {
      setSelectedEdit(record);
    }
    setPopupProvince(!popupProvince);
  };

  const memoFilters = useMemo(() => presetFilters, [presetFilters]);

  useEffect(() => {
    setPresetFilters(!_.isEmpty(nation) ? { nation: { value: nation.id, operator: "=" } } : {});
  }, [nation]);

  useEffect(() => {
    if (selectedData) {
      setProvinceIds(selectedData);
      setSelected(selectedData);
    }
  }, []);

  // Form SUbmit
  const handleModalSave = async (value) => {
    if (value) {
        setSelected(value?.id);
        setProvinceIds(value?.id);
        setRow(value);
        onSelect(value.id);
    }
    // Always update reload, whether a value is provided or not
    setReload(reload + 1);
};

  // Construct the filters and attach to params of datatable
  const handleTableChange = async (filters) => {
    setLoading(true);
    const result = await getAllProvinces(_.merge(filters, filter));

    //set static data for tag selection check
    setStaticData(result.data.data);

    setLoading(false);
    return result.data;
  };

  const handleDeleteRow = async (id) => {
    confirm({
      title: "Confirm delete?",
      icon: <IconAlertCircle color={"#faad14"} size="20" className="anticon" />,
      transitionName: "ant-modal-slide-up",
      content: "Continue with delete",
      okText: "Continue",
      okType: "danger",
      cancelText: "Cancel",
      async onOk() {
        setLoading(id);
        const { data, error, validationErrors } = await deleteProvince(id);
        if (error || validationErrors) {
          message.error(error.response.data.message);
          setLoading(false);
        } else {
          message.success(`Province #${id} successfully deleted`);
          // Reload all
          setReload(reload + 1);
        }
        setLoading(false);
      },
    });
  };

  const tableColumns = [
    {
      title: "Province",
      key: "name",
      render: (text, record) => (
        <Button type="text" onClick={() => onSelect(record)}>
          {record?.name}
        </Button>
      ),
    },
    {
      title: "Code",
      key: "code",
    },
    {
      title: "Nation",
      dataIndex: "nation",
      key: "nation",
      filterable: filter ? false : true,
      render: (text, record) => <span>{text.id}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => (
        <Space.Compact>
          {showArrow && <Button onClick={() => onSelect(record)} icon={<IconArrowRight />} />}
          <Button onClick={() => toggleProvincePopup(record)} icon={<IconPencilMinus />}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteRow(record.id)} icon={<IconTrash />} />
        </Space.Compact>
      ),
    },
  ];

  return (
    <>
      {popupProvince && (
        <ModalProvince
          opened={popupProvince}
          toggle={toggleProvincePopup}
          data={selectedEdit}
          reload={() => {
            setReload(reload + 1);
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
            getAllProvinces({
              columns: {
                id: { search: { value: selected, operator: "=" } },
              },
            })
          }
         /> : "Provinces"}
        extra={[
          openInModal && (
            <Button
              key={0}
              disabled={!selectedData}
              icon={<IconX color="#e20004" />}
              onClick={() => {
                setProvinceIds(null);
                onSelect(null);
                setSelected(null);
                setRow(null);
              }}
            >
              Remove current selection
            </Button>
          ),
          <Button key={1} type="primary" icon={<IconPlus />} onClick={() => toggleProvincePopup()}>
            Add new
          </Button>,
        ]}
      />

      <Datatable
        columns={tableColumns}
        fetchData={handleTableChange}
        rowKey="id"
        watchStates={[reload]}
        presetFilters={memoFilters}
        loading={loading}
        rowSelection={
          selectable
            ? {
                type: "radio",
                onChange: (selectedRowKeys, selectedRows) => {
                  setProvinceIds(selectedRows[0].id);
                  onSelect(selectedRows[0].id);
                  setSelected(selectedRows[0].id);
                  setRow(selectedRows[0]);
                },
                selectedRowKeys: [provinceIds],
              }
            : false
        }
      />
    </>
  );
};

export default TableProvinces;
