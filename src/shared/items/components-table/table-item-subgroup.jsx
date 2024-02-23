import React, { useCallback, useEffect, useMemo, useState } from "react";
import Datatable from "../../datatable/datatable";
import PageActions from "@/shared/components/page-actions";
import { getAllItemSubFamilies } from "@/api/items";
import { IconX } from "@tabler/icons-react";
import { Button } from "antd";

const ItemSubGroupTable = ({ onSelect, selectable, selectedData, openInModal }) => {
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);
  const [selected, setSelected] = useState(null);
  const [itemSubgroupIds, setItemSubgroupIds] = useState(null);

  const handleTableChange = async (filters) => {
    setLoading(true);
    const response = await getAllItemSubFamilies(filters);
    setLoading(false);
    return response.data;
  };

  useEffect(()=> {
    if(selectedData){
      setItemSubgroupIds(selectedData)
      setSelected(selectedData)
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
        title="Item Subgroups"
        extra={[
          openInModal && (

          <Button
								key={2}
								disabled={!selectedData}
                icon={<IconX color="#e20004"/>}
								onClick={() => {
									setItemSubgroupIds(null)
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
                selectedRowKeys: [itemSubgroupIds],
                onChange: (selectedRowKeys, selectedRows) => {
                  setItemSubgroupIds(selectedRows[0].id);
                  onSelect(selectedRows[0].id);
                },
              }
            : false
        }
      />
    </>
  );
};

export default ItemSubGroupTable;
