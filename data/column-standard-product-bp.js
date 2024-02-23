import React from 'react'
import { Space, Row, Radio } from 'antd'

export function columnsProductSellerConfigurator(){
return [ 

  {
    title: 'ID',
    key: 'id',
    inputFilter: true,
    width:"20%",
    render: (_text, record) => (
      <Space align='center'>
        <span>{record.id}</span>
      </Space>
    )
  },
  {
    title: 'Description',
    description: 'Label',
    inputFilter: true,
    width:"20%",

    key: 'desc',

    render: (_text, record) => (
      <Space align='center'>
        <span>{record.desc}</span>
      </Space>
    )
  },
  {
    title: 'Supplier',
    key: 'supplier',
    width:"20%",
    sorter:true,
      render: (_text, record) => (
      <Space align='center'>
        <span>{record.supplier}</span>
      </Space>
    )
  },
  {
    title: 'Customer',
    key: 'customer',
    width:"20%",

    sorter:true,
    render: (_text, record) => <span>{record.customer}</span>
  },
  {
    title: 'BP Destination Count',
    key: 'bp_destinations_count',
    width:"20%",

    sorter:true,
    render: (_text, record) => <span>{record.bp_destinations_count}</span>
  },
    ]
}