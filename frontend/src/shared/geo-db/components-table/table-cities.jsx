import React, { useEffect, useMemo, useState } from "react";
import Datatable from "@/shared/datatable/datatable";
import { getAllCities, deleteCity } from "@/api/geo/cities";
import ModalCity from "../modals/modal-city";
import PageActions from "@/shared/components/page-actions";
import { Space, Button, Modal, message } from "antd";
const { confirm } = Modal;
import { IconTrash, IconAlertCircle, IconPlus, IconArrowRight, IconPencilMinus, IconX } from "@tabler/icons-react";
import _ from "lodash";
import TagSelection from "@/shared/components/tag-selection";

const TableCities = ({ onSelect, selectable, showArrow, nation, province, filter, selectedData, openInModal }) => {
  const [popupCity, setPopupCity] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null); //state to know which one is selected
  const [selectedEdit, setSelectedEdit] = useState(null); //state to know which one needs to be edited
  const [reload, setReload] = useState(0);
  const [presetFilters, setPresetFilters] = useState({});
  const [cityIds, setCityIds] = useState(null);
  const [row, setRow] = useState(null);
  const [staticData, setStaticData] = useState([]);


  const toggleCityPopup = (record) => {
    if (record) {
      setSelectedEdit(record);
    }
    setPopupCity(!popupCity);
  };

  const memoFilters = useMemo(() => presetFilters, [presetFilters]);

  useEffect(() => {
    setPresetFilters(
      !_.isEmpty(province) || !_.isEmpty(nation)
        ? {
            province: { value: province?.code, operator: "=" },
            nation: { value: province?.nation?.id || (nation && nation.id), operator: "=" },
          }
        : {},
    );
  }, [nation, province]);

  useEffect(() => {
    if (selectedData) {
      setCityIds(selectedData);
      setSelected(selectedData);
    }
  }, []);


  const handleModalSave = (value) => {
    if (value) {
      console.log('edit');
      setSelected(value.id);
      setCityIds(value.id);
      setRow(value);
      onSelect(value.id);
    }
    setReload(reload + 1);
  };

  const handleTableChange = useMemo(
    () => async (filters) => {
      setLoading(true);
      const result = await getAllCities(_.merge(filters, filter));
      setStaticData(result.data.data);
      setLoading(false);
      return result.data;
    },
    [filter]
  );

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
        const { data, error, validationErrors } = await deleteCity(id);
        if (error || validationErrors) {
          message.error(error.response.data.message);
        } else {
          message.success(`City #${id} successfully deleted`);
          setReload(reload + 1);
        }
        setLoading(false);
      },
    });
  };


  const tableColumns = [
    {
      title: "City",
      key: "name",
      render: (text, record) => (
        <Button type="text" onClick={() => onSelect(record)}>
          {record?.name}
        </Button>
      ),
    },
    {
      title: "Province",
      dataIndex: "province",
      key: "province",
      render: (province, record) => <span>{province?.code}</span>,
    },
    {
      title: "Nation",
      dataIndex: "nation",
      key: "nation",
      filterable: filter ? false : true,
      render: (nation, record) => <span>{nation.id}</span>,
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => (
        <Space.Compact>
          {showArrow && <Button onClick={() => onSelect(record)} icon={<IconArrowRight />} />}
          <Button onClick={() => toggleCityPopup(record)} icon={<IconPencilMinus />}>
            Edit
          </Button>
          <Button danger onClick={() => handleDeleteRow(record.id)} icon={<IconTrash />} />
        </Space.Compact>
      ),
    },
  ];

  return (
    <>
      {popupCity && (
        <ModalCity
          opened={popupCity}
          toggle={toggleCityPopup}
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
            getAllCities({
              columns: {
                id: { search: { value: selected, operator: "=" } },
              },
            })
          }
         /> : "Cities"}
        extra={[
          openInModal && (
            <Button
              key={0}
              disabled={!selectedData}
              icon={<IconX color="#e20004" />}
              onClick={() => {
                setCityIds(null);
                onSelect(null);
                setSelected(null);
                setRow(null);
              }}
            >
              Remove current selection
            </Button>
          ),
          <Button key={1} icon={<IconPlus />} type="primary" onClick={() => toggleCityPopup()}>
            Add new
          </Button>
        ]}
      />
      <div className="page-content">
        <Datatable
          columns={tableColumns}
          fetchData={handleTableChange}
          rowKey={"id"}
          watchStates={[reload, nation, province]}
          presetFilters={memoFilters}
          loading={loading}
          rowSelection={
            selectable
              ? {
                  type: "radio",
                  onChange: (selectedRowKeys, selectedRows) => {
                    setCityIds(selectedRows[0].id);
                    onSelect(selectedRows[0].id);
                    setSelected(selectedRows[0].id);
                    setRow(selectedRows[0]);
                  },
                  selectedRowKeys: [cityIds],
                }
              : false
          }
        />
      </div>
    </>
  );
};

export default TableCities;
