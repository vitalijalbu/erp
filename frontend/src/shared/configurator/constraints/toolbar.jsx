import Link from "next/link";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Menu, Row, Col } from "antd";


const Toolbar = () => {
  const router = useRouter();
  const { subtype } = router.query;
  const navLinks = [
    {
      key: "/configurator/constraints",
      label: <Link href={`/configurator/constraints/`}>All constraints</Link>,
    }, 
    {
      key: "/configurator/constraints?subtype=activation",
      label: <Link href={`/configurator/constraints?subtype=activation`}>Activation</Link>,
    },
    {
      key: "/configurator/constraints?subtype=validation",
      label: <Link href={`/configurator/constraints?subtype=validation`}>Validation</Link>,
    },
    {
      key: "/configurator/constraints?subtype=value",
      label: <Link href={`/configurator/constraints?subtype=value`}>Value</Link>,
    },
    {
      key: "/configurator/constraints?subtype=dataset",
      label: <Link href={`/configurator/constraints?subtype=dataset`}>Dataset</Link>,
    },
  ];


  return (

      <Menu mode="horizontal" className="transparent" items={navLinks} defaultActiveFirst/>

  );
};

export default Toolbar;
