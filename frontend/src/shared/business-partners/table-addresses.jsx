import React, { useEffect, useState } from "react";
import { getBPShippingAddresses } from "@/api/bp";
import PageActions from "@/shared/components/page-actions";
import { Button, Col, Row } from "antd";
import { IconPlus, IconX } from "@tabler/icons-react";
import Datatable from "@/shared/datatable/datatable";
import _ from "lodash";



const TableAddresses = (props) => {

  const [popupAddress, setPopupAddress] = useState(null);
  const [selected, setSelected] = useState(null);
  const [reload, setReload] = useState(0);
  const [addressIds, setAddressIds] = useState([])


  const removeSelection = async () => {
    setSelected(null);
    setAddressIds([]);
    props?.onSelect(null);
}


  const toggleAddressPopup = (record = null) => {
    setSelected(record);
    setPopupAddress(!popupAddress);
  };

  useEffect(()=> {
    if(props.selectedData){
      setAddressIds([props.selectedData])
      setSelected(props.selectedData);
    }
  }, []);


 // Construct the filters and attach to params of datatable
 const handleTableChange = async (filters) => {
  const result = await getBPShippingAddresses(props?.id, props?.type/*_.merge(props.filter, filters)*/);
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
      sorter: false
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
      sorter: false
    }
  ];


  return (
    <div className="page">
      {popupAddress && (
        <ModalAddress
          opened={popupAddress}
          toggle={toggleAddressPopup}
          data={selected ?? null}
          reload={() => {
            setReload(reload + 1)
            setSelected(selected)
          }}
        />
      )}
      <PageActions
        extra={[
          props.isModal && !props.isAssociation && (
            <Button
            key={2}
            disabled={!props.selectedData}
            icon={<IconX color="#e20004" />}
            onClick={removeSelection}
        >
            Remove current selection
        </Button>
          )]
        }
      />
      <div className="page-content">
        <Row>
          <Col span={24} className="mb-3">
            <Datatable
              columns={tableColumns}
              fetchData={handleTableChange}
              rowKey="id"
              watchStates={[reload]}
              rowSelection={
                props.selectable
                  ? {
                      type: props.selection ?? "radio",
                      fixed: true,
                      preserveSelectedRowKeys: false,
                      selectedRowKeys: addressIds,
                      onChange: (selectedRowKeys, selectedRows) => {
                        if(props.selection === "checkbox"){   
                          props?.onSelect(selectedRows);
                          setAddressIds(_.map(selectedRows,'id'))
                        }else{
                          const selectedValue = selectedRows.length === 1 ? selectedRows[0].id : selectedRowKeys;
                          props?.onSelect(selectedValue);
                          setAddressIds([selectedValue])
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

export default TableAddresses;
