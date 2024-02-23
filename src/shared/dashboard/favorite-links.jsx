"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Card, Space, Avatar, Table, Typography } from "antd";
import { IconStar } from "@tabler/icons-react";
const { Text } = Typography;

const tableColumns = [
  {
    key: "title",
    render: ({title}) => (
      <Link href="#">
       <Space wrap> 
       <Avatar style={{backgroundColor: '#d5e3dc', color: '#1f5e41'}} shape="square" size="small" icon={<IconStar/>}/> 
       <Text strong>{title}</Text>
       </Space>
        </Link>
    ),
  },    
  {
    key: "content",
    render: (record) => (
      <Text>{record?.attributes?.content}</Text>
    ),
  }
];

const dummy = [
  {title: "Functions", url: "/configurator/functions"},
  {title: "Users Management", url: "/users"},
  {title: "Reports", url: "/reports/"},
  {title: "Cutting", url: "/reports/cutting/history"},
];

const FavoriteLinks = () => {
  const [loading, setLoading] = useState(false);
  const [notifications, setInbox] = useState([]);


  return (
    <section className="mb-3">
               <Card title="Favorite links" className="p-0"> 
               <Table
        columns={tableColumns}
        dataSource={[]}
        loading={loading}
        showHeader={false}
        rowKey="id"
        pagination={false}
      />
            </Card>
    </section>
  );
};

export default FavoriteLinks;
