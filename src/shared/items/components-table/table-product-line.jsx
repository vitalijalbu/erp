import React, { useCallback, useEffect, useMemo, useState } from "react";
import Datatable from "../../datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { getAllItemLines } from "@/api/items";
import { Button } from "antd";
import { IconX } from "@tabler/icons-react";


const ProductLineTable = ({ onSelect, selectable, selectedData, openInModal }) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [productLineIds, setProductLineIds] = useState(null);

  const handleTableChange = async (filters) => {
    setLoading(true);
    const response = await getAllItemLines(filters);
    setLoading(false);
    return response.data;
  };

  useEffect(()=> {
    if(selectedData){
      setProductLineIds(selectedData);
      setSelected(selectedData);
    }
  }, []);

  const tableColumns = [
    {
      title: "Code",
      key: "code",
    },
    {
      title: "Description",
      key: "description",
    },
  ];

  return (
    <>
      <PageActions 
        title="Product Lines"
        extra={[
          openInModal && (

          <Button
								key={2}
								disabled={!selectedData}
                icon={<IconX color="#e20004"/>}
								onClick={() => {
									setProductLineIds(null)
                  onSelect(null)
									}}
							>
								Remove current selection
							</Button>
          )
          ]}
      />
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
                selectedRowKeys: [productLineIds],
                onChange: (selectedRowKeys, selectedRows) => {
                  setProductLineIds(selectedRows[0].id);
                  onSelect(selectedRows[0].id);
                },
              }
            : false
        }
      />
    </>
  );
};

export default ProductLineTable;
