import React from "react";
import {
	Table,
} from "antd";
import { numberFormatter, dateStringToDate } from "@/hooks/formatter";
import Link from "next/link";



const BOMDetailsTable = (props) => {

	const materials = props.materials || [];
	
	return (
		<Table 
			columns={[
                {title: 'Position', key: 'position', dataIndex: 'position', width:100},
				{title: 'Item', key: 'item', dataIndex: 'item', render: (e) => <Link href={`/items/${e.IDitem}`} target="_blank">{e.item} - {e.item_desc}</Link>},
				{title: 'Qty', key: 'qty', dataIndex: 'quantity', render: (e, row) => numberFormatter(e).toString() + ' ' + row.item.um},
                {title: 'Production Process', key: 'process', dataIndex: 'process', render: (e) => e.name}
			]}
			pagination={false}
			dataSource={materials}
		>
		</Table>
  	);
};

export default BOMDetailsTable;
