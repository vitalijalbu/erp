import React, { useState } from "react";
import Link from "next/link";
import { Button, Menu } from 'antd';

const Toolbar = ({data}) => {

  return (
    <Menu mode="horizontal" items={[
      { label: <Link href="/users">Users</Link>, key: "/users" },
      { label: <Link href="/users/roles">User roles</Link>, key: "/contacts" },
    ]}/>
  );
};


export default Toolbar;
