import React, { useState, useEffect } from "react";
import Datatable from "@/shared/datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { getAllNations } from "@/api/geo/nations";
import { Space, Button } from "antd";
import { IconArrowRight, IconX } from "@tabler/icons-react";
import TagSelection from "@/shared/components/tag-selection";

const CountriesTable = ({ onSelect, filter, selectable, showArrow, selectedData, openInModal }) => {
  const [loading, setLoading] = useState(false);
  const [popupCountry, setPopupCountry] = useState(null);
  const [selected, setSelected] = useState(selectedData);
  const [reload, setReload] = useState(0);
  const [countryIds, setCountryIds] = useState(null);
  const [row, setRow] = useState(null);
  const [staticData, setStaticData] = useState([]);

  const toggleCountryPopup = (record) => {
    if (record) {
      setSelected(record);
    }
    setPopupCountry(!popupCountry);
  };

  useEffect(() => {
    if (selectedData) {
      setCountryIds(selectedData);
      setSelected(selectedData);
      setRow(selectedData);
    }
  }, []);

  // Construct the filters and attach to params of datatable
  const handleTableChange = async (filters) => {
    setLoading(true);
    const result = await getAllNations(_.merge(filters, filter));
    //set static data for tag selection check
    setStaticData(result.data.data);

    setLoading(false);
    return result.data;
  };

  const tableColumns = [
    {
      title: "Nation",
      key: "name",
      sorter: true,
      render: (text, record) => (
        <Button type="text" onClick={() => onSelect(record)}>
          {record?.name}
        </Button>
      ),
    },
    {
      title: "ISO Code Alpha 2",
      key: "id",
    },
    {
      title: "ISO Code Alpha 3",
      key: "iso_alpha_3",
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (text, record) => showArrow && <Button onClick={() => onSelect(record)} icon={<IconArrowRight />} />,
    },
  ];

  return (
    <>
      {popupCountry && (
        <ModalCountry
          opened={popupCountry}
          toggle={toggleCountryPopup}
          data={selected ?? null}
          reload={() => {
            setReload(reload + 1);
          }}
        />
      )}
      <PageActions
        title={openInModal ? <TagSelection
          data={staticData}
          selected={selected}
          displayField="name"
          callback={() =>
            getAllNations({
              columns: {
                id: { search: { value: selected, operator: "=" } },
              },
            })
          }
        />
         : "Countries"}
        extra={[
          openInModal && (
            <Button
              key={2}
              disabled={!selectedData}
              icon={<IconX color="#e20004" />}
              onClick={() => {
                setCountryIds(null);
                onSelect(null);
                setSelected(null);
                setRow(null);
              }}
            >
              Remove current selection
            </Button>
          )
        ]}
      />
      <div className="page-content">
        <Datatable
          columns={tableColumns}
          fetchData={handleTableChange}
          rowKey="id"
          watchStates={[reload]}
          loading={loading}
          rowSelection={
            selectable
              ? {
                  type: "radio",
                  onChange: (selectedRowKeys, selectedRows) => {
                    setCountryIds(selectedRows[0].id);
                    onSelect(selectedRows[0].id);
                    setSelected(selectedRows[0].id);
                    setRow(selectedRows[0]);
                  },
                  selectedRowKeys: [countryIds],
                }
              : false
          }
        />
      </div>
    </>
  );
};

export default CountriesTable;
