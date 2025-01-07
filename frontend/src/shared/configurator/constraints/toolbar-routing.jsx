import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Menu, Row, Col } from "antd";


const ToolbarRouting = () => {
  const router = useRouter();
  const { subtype } = router.query;
  const navLinks = [
    {
      key: "/configurator/routing-constraints",
      label: <Link href={`/configurator/routing-constraints`}>All Routing Constraints</Link>,
    }, 
    {
      key: "/configurator/routing-constraints?subtype=activation",
      label: <Link href={`/configurator/routing-constraints?subtype=routing_activation`}>Activation</Link>,
    },
    {
      key: "/configurator/routing-constraints?subtype=workload",
      label: <Link href={`/configurator/routing-constraints?subtype=routing_workload`}>Workload</Link>,
    }
  ];


  return (

      <Menu mode="horizontal" className="transparent" items={navLinks} defaultActiveFirst/>

  );
};

export default ToolbarRouting;
