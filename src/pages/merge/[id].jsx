import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import { IconTrash, IconDeviceFloppy, IconPrinter, IconCheckbox, IconPlus } from "@tabler/icons-react";
import { getLotToMerge, getAdditionalLotsToMerge, createMerge, deleteMerge } from "@/api/lots";
import { useValidationErrors } from "@/hooks/validation-errors";
import UserPermissions from "@/policy/ability";
import {
  Row,
  Col,
  Card,
  Space,
  List,
  Form,
  Input,
  Button,
  message,
  Modal,
  Tag,
  Typography,
  Table
} from "antd";
const { Text, Title } = Typography;
const { confirm } = Modal;
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import DrawerMerge from "@/shared/stocks/drawer-merge-confirm";



const View = (props) => {
  //Set page permissions
  if (!UserPermissions.authorizePage("items_stocks.management")) {
    return false;
  }
  const router = useRouter();
  const { id } = router.query;
  const [item, setItemData] = useState({});
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const validationErrorsBag = useValidationErrors();
  const [popup, setPopup] = useState(false);

  const togglePopup = () => {
    setPopup(!popup);
  };




  // Datatable handle change
  const handleTableChange = useCallback(async (params) => {
    if (id) {
      const filters = {
        ...params,
        idStock: id,
        idMerge: 0
      };

      setLoading(true);
      const result = await getLotToMerge(filters);
      setItemData({ idItem: result.data[0]?.IDitem, idWarehouse: result.data[0]?.IDwarehouse, um: result.data[0]?.um }); // Set static state item
      setLoading(false);
      return result;
    }
    return [];
  }, [id, reload]);

  // Datatable handle change
  const handleAdditionalChange = useCallback(async (params) => {
    setLoading(true);
    const result = await getAdditionalLotsToMerge({ ...params, ...item });
    setLoading(false);
    return result.data;
  }, [id, item]);


  //Create Lot Merge
  const handleCreate = async () => {
    setLoading(true);
    validationErrorsBag.clear();
    const { status, error, validationErrors } = await createMerge({ idStock: id, idMerge: 0 });
    setLoading(false);

    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
      }
      message.error("Error during saving operation");
    }
    else {
      message.success("Lot merged succesfully");
      setReload(reload + 1);
    }
  };

  //Create Lot Merge
  const handleDelete = async (rowId) => {
    setLoading(true);
    validationErrorsBag.clear();
    const { status, error, validationErrors } = await deleteMerge(rowId);
    setLoading(false);

    if (error) {
      if (validationErrors) {
        validationErrorsBag.setValidationErrors(validationErrors);
      }
      message.error("Error during deleting operation");
    }
    else {
      message.success("Lot deleted succesfully");
      setReload(reload + 1);
    }
  };


  //Definte table 1 columns
  const tableColumns = [
    {
      title: "Lot",
      key: "IDlot",
      copyable: true,
      sorter: false,
    },
    {
      title: "Step roll",
      key: "stepRoll",
      type: "bool",
      sorter: false,
      filterable: false
    },

    {
      title: "Date Lot",
      key: "date_lot",
      type: "datetime",
      sorter: false,
      filterable: false
    },
    {
      title: "Item",
      key: "item",
      copyable: true,
      sorter: false,
      filterable: false
    },
    {
      title: "Description",
      key: "item_desc",
      sorter: false,
      filterable: false
    },
    {
      title: "Qty",
      align: "right",
      key: "qty",
      type: 'qty',
      after: (record) => record.um,
      sorter: false,
      filterable: false
    },
    {
      title: "Dimension",
      key: "dim",
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
      title: "Warehouse location",
      key: "lcdesc",
      sorter: false,
      filterable: false
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <>
          {record.IDmerge === '0' ?
            (<Button title="Create a merge order to sew 2 or more lots together" icon={<IconPlus />} type="primary" onClick={() => togglePopup(record)}>
              Create
            </Button>) : (
              <Button icon={<IconTrash />} danger onClick={() => handleDelete(record.IDmerge_row_picking_id)} />)
          }
        </>
      )
    }
  ];
  //Definte table 2 columns
  const tableAdditionalColumns = [
    {
      title: "Lot",
      key: "IDlot",
      copyable: true,
      sorter: false,
      filterable: false
    },
    {
      title: "Step roll",
      key: "stepRoll",
      type: "bool",
      sorter: false,
      filterable: false
    },

    {
      title: "Date Lot",
      key: "date_lot",
      type: "datetime",
      sorter: false,
      filterable: false
    },
    {
      title: "Item",
      key: "item",
      copyable: true,
      sorter: false,
      filterable: false
    },
    {
      title: "Description",
      key: "item_desc",
      sorter: false,
      filterable: false
    },
    {
      title: "Qty",
      align: "right",
      key: "qty",
      type: 'qty',
      after: (record) => record.um,
      sorter: false,
      filterable: false
    },
    {
      title: "W",
      key: "LA",
      type: 'number',
      sorter: false,
      filterable: false
    },
    {
      title: "L",
      key: "LU",
      type: 'number',
      sorter: false,
      filterable: false
    },
    {
      title: "P",
      key: "PZ",
      type: 'number',
      sorter: false,
      filterable: false
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
        <>
          {item?.um === 'm2' ?
            (
              <Button title="Create a merge order to sew 2 or more lots together" icon={<IconPlus />} type="primary" onClick={() => togglePopup(record.idStock)}>
                Add to picking
              </Button>
            ) : null}
        </>
      )
    }
  ];


  return (
    <>
      {popup && <DrawerMerge opened={popup} toggle={togglePopup} data={item} reload={reload} />}
      <div className="page">
        <PageActions
          backUrl="/stocks"
          title={<>Lot order merge <mark>{id}</mark></>}
          subTitle="(the below lots will be merged toghether)" />
        <div className="page-content">
          <Row className="mb-3">
            <Col span={24}>
              <Datatable
                columns={tableColumns}
                fetchData={handleTableChange}
                rowKey="IDlot"
                watchStates={[id, reload]}
                pagination={false} />
            </Col>
          </Row>
          <Row className="mb-3">
            <Col span={24}>
              <Title level={5}>Merge additional lots:</Title>
            </Col>
            <Col span={24}>
              <Datatable
                columns={tableAdditionalColumns}
                fetchData={handleAdditionalChange}
                rowKey="IDstock"
                watchStates={[item, reload]}
                pagination={false} />
            </Col>
          </Row>

        </div>
      </div>
    </>
  );
};

export default View;
