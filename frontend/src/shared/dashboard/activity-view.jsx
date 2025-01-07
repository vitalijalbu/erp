import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import UserPermissions from "@/policy/ability";
import * as dayjs from 'dayjs';
import { getActivityViewerReports } from "@/api/reports/activity";
import { Avatar, Form, Space, Row, Col, Divider, Dropdown, Table, Button, DatePicker, Tag, Typography, message, Tooltip } from "antd";
import PageActions from "@/shared/components/page-actions";
import Datatable from "@/shared/datatable/datatable";
import { IconFileText } from "@tabler/icons-react";

const ActivityView = () => {
  //Set page permissions
  if (!UserPermissions.authorizePage("report.show")) {
    return false;
  }

  const router = useRouter();

  const tableColumns = [
    {
      title: "Activity",
      key: "activity",
      sorter: false,
      filterable: false,
      render: ({ activity }) => <Tag>{activity}</Tag>,
    },
    {
      title: "Wh",
      key: "wdesc",
      sorter: false,
      filterable: false,
    },
    {
      title: "Date",
      key: "dt",
      type: 'datetimetz',
      sorter: false,
      filterable: false,
    },
    {
      title: "Item",
      key: "item",
      sorter: false,
      filterable: false
    },
    {
      title: "Desc",
      key: "item_desc",
      sorter: false,
      filterable: false
    },
    {
      title: "Main lot",
      key: "IDlot",
      sorter: false,
      filterable: false,
      render: (record) => record.IDlot ? record.IDlot : 'Lot not found'
    },
    {
      title: "Dim",
      key: "dim",
      sorter: false,
      filterable: false
    },
    {
      title: "Ord. ref.",
      description: "Order reference",
      key: "ord_rif",
      sorter: false,
      filterable: false
    },
    {
      title: "Username",
      key: "username",
      sorter: false,
      filterable: false,
      render: ({ username }) => <Tag>{username}</Tag>,
    },
    {
      title: "Activity details",
      key: "msg",
      sorter: false,
      filterable: false
    },
    {
      title: "Add. info",
      key: "actions",
      align: "right",
      className: "table-actions",
      render: (record) => (
          <Tooltip title={record.note}>
            <Button  disabled={!record.note} icon={<IconFileText />}/>
          </Tooltip>
      )
    }
  ];

  const handleTableChange = async (params) => {
    const { data, error } = await getActivityViewerReports(params);
    if (error) {
      message.error(error?.response?.data?.message || "Error during data fetching");
    }
    return { data };
  };

  return (

    <Datatable
      fetchData={handleTableChange}
      columns={tableColumns}
      rowKey={(record) => JSON.stringify(record)}
      pagination={false}
    />

  );
};

export default ActivityView;
