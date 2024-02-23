import React from 'react'
import { Space, Row, Radio } from 'antd'

export function columnsProductSellerConfigurator(){



  return [
 
  {
    title: 'code',
    key: 'IDitem',
    dataIndex: 'IDitem',
    width:'25%',
    inputFilter: true,
    sorter: (a, b) => a.IDitem.localeCompare(b.IDitem),
    render: (_text, record) => (
      <Space align='center'>
        <span>{record.IDitem}</span>
      </Space>
    )
  },
  {
    title: 'Name',
    width:'25%',
    description: 'Label',
    inputFilter: true,
    key: 'item',
    dataIndex: 'item',
    sorter: (a, b) => a.item.localeCompare(b.item),
    render: (_text, record) => (
      <Space align='center'>
        <span>{record.item}</span>
      </Space>
    )
  },
  {
    title: 'Description',
    key: 'item_desc',
    dataIndex: 'item_desc',
    width:'25%',
    inputFilter: true,
    sorter: (a, b) => a.item_desc.localeCompare(b.item_desc),
    render: (_text, record) => (
      <Space align='center'>
        <span>{record.item_desc}</span>
      </Space>
    )
  },
  {
    title: 'Unit of measure',
    width:'25%',
    key: 'um',
    dataIndex: 'um',
    sorter: (a, b) => a.um.localeCompare(b.um),
    render: (_text, record) => <span>{record.um}</span>
  },
    ]
}