import React, { useState, useEffect, useCallback } from "react";
// import console tabs and content
import ConsoleDebug from "@/shared/widgets/console-debug";
import PageLayout from "@/layouts/page-layout";
import { debugState } from "@/store/debugState";
import { useRecoilState, useSetRecoilState } from "recoil";


const Console = ({ opened, toggle, data, reload }) => {



 // console.log("console received the data",debugData)


  return (
    <PageLayout>
     <ConsoleDebug/>
    </PageLayout>
  );
};

Console.getInitialProps = () => {
  return { layout: 'page' }; // Set the layout prop to 'admin'
};

export default Console;

