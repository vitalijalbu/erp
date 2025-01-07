import React, { useState, useEffect, useCallback, useRef } from "react";
import { Space, Avatar, Button, Result, Col, Tabs } from "antd";
import JsonView from '@uiw/react-json-view';
import { IconAlertCircle, IconClearAll, IconTrash } from "@tabler/icons-react";
import _ from 'lodash';
import { useRouter } from "next/router";
import { FloatButton } from 'antd';
import { io } from 'socket.io-client';
import { authorizeDebug } from "@/api/configurator/debug";


const ConsoleDebug = ({ opened, toggle, data, reload }) => {


  const [consoleData, setConsoleData] = useState({
    commands: [],
    functions_stack: [],
    php_errors: [],
    dumps: [],
    error: [],
    plan: [],
  })

  const stack = useRef({
    commands: [],
    functions_stack: [],
    php_errors: [],
    dumps: [],
    error: [],
    plan: [],
  });



  const extractData = (obj) => {
    if(!obj && !_.isObject(obj)) return;
    return {
      commands: obj.commands || [],
      functions_stack: obj.functions_stack || [],
      php_errors: obj.php_errors || [],
      dumps: obj.dumps || [],
      error: obj.error || [],
      plan: obj.plan?.data || []
    };
  };

  const clean = () => {
    const cleanData = {};
    Object.keys(consoleData).forEach(v => cleanData[v] = [])
    setConsoleData({
      ...cleanData
    })
    stack.current = cleanData;
  }

  const receiveObject = (event) => {
    console.log("Received object:", event)
    const newData = event.data;
    const currentData = extractData(newData);
    const newConsoleData = _.cloneDeep(stack.current);

    newConsoleData['commands'].push({ cmd: currentData.commands, status: event.status });
    newConsoleData['functions_stack'].push({ cmd: currentData.functions_stack, status: event.status });
    newConsoleData['php_errors'].push({ cmd: currentData.php_errors, status: event.status });
    newConsoleData['dumps'].push({ cmd: currentData.dumps, status: event.status });
    newConsoleData['error'].push({ cmd: currentData.error, status: event.status });
    newConsoleData['plan'].push({ cmd: currentData.plan, status: event.status });
  
    stack.current = _.cloneDeep(newConsoleData);

    setConsoleData({
      ...newConsoleData
    });
  };

  const socket = useRef(null);

  useEffect(() => {
    if(!socket.current) {
      socket.current = io(process.env.NEXT_PUBLIC_BROADCAST_URL, {
        transports: ["websocket"],
      });
      socket.current.on('connect', async () => {
        if(await authorizeDebug(socket.current.id)) {
          socket.current.emit('join_debug');
        }
      })
      socket.current.on('debug', (event) => {
        receiveObject(event);
      })
    }

    return () => {
      if(!socket.current) {
        socket.current.close();
      }
    }
  }, [])


  // Create a static array of objects with label and value properties
  const items = [
    { label: "Dumps", key: "dumps", children: <DumpsTabDebug data={consoleData.dumps} /> },
    { label: "Errors", key: "errors", children: <TabDebug data={consoleData.error} /> },
    { label: "Configurator Commands", key: "commands", children: <TabDebug data={consoleData.commands} /> },
    { label: "Constraints Plan", key: "plan", children: <TabDebug data={consoleData.plan} /> },
    { label: "Functions stack", key: "functions_stack", children: <TabDebug data={consoleData.functions_stack} /> },
    { label: "PHP errors", key: "php_errors", children: <TabDebug data={consoleData.php_errors} /> },
  ];

  return (

    <div className="configurator-console-tabs">
      <Tabs tabPosition="top" defaultActiveKey={"dumps"} items={items} size="medium" />
      <FloatButton 
        shape="square"
        danger
        onClick={() => {
          clean();
        }} 
        style={{
          right: 12,
          bottom: 12,
        }}
        icon={<IconTrash size="20" color="#e20004"/>}
      />
    </div>

  );
};

export default ConsoleDebug;


//=============================================================================
// Component Addon
//=============================================================================


const TabDebug = ({ data }) => {


  return (
    <div className="px-2">
      {data?.length > 0 ? (
        data.map((child, index) => (
          <div key={index}>
            <span>
              Status code:{child.status}
            </span>
            <JsonView enableClipboard={false} collapsed={2} value={child.cmd} />
          </div>
        ))
      ) : (<Result
        icon={<IconAlertCircle />}
        title="No logs activity"
        subTitle="Test some functions to see logs below"
      />)}
    </div>
  );
};

const DumpsTabDebug = ({ data }) => {


  return (
    <div className="px-2">
      {data?.length > 0 ? (
        data.map((child, index) => (
          <div key={index}>
            {
              child.cmd.map((dump) =>
                <div>
                    {dump.comment != null && dump.comment.toString().length && (<mark>{dump.comment}</mark>) }
                  <JsonView enableClipboard={false} collapsed={2} value={dump} />
                </div>
              )
            }
          </div>
        ))
      ) : (<Result
        icon={<IconAlertCircle />}
        title="No logs activity"
        subTitle="Test some functions to see logs below"
      />)}
    </div>
  );
};