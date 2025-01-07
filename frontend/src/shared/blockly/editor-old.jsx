import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from "react";
import { useRouter } from "next/router";
import { useRecoilState, atom, useSetRecoilState } from 'recoil';
import { blocklyFunctionModal } from "@/store/blockly";
import Blockly from "blockly";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
import { toolboxJson } from "@/lib/blockly/toolbox";
import SelectFunction from "./select-function";
import { initCustomBlocks } from "@/lib/blockly/erp-custom-blocks";



const Editor = forwardRef((props, ref) => {

  initCustomBlocks()
  const [modalFunction, SetmodalFunction] = useRecoilState(blocklyFunctionModal);
  console.log('modalFunction', modalFunction);
  const router = useRouter();
 
  // props.state => JSON del workspace da caricare
  const [workspaceState, setWorkspaceState] = useState(props.state)
  const [functionValue, setFunctionValue] = useState(null)
  const blocklyDiv = useRef(null); // Initialize with null
  const toolbox = useRef(toolboxJson());
  const primaryWorkspace = useRef();
  const callFunctionBlock = useRef()
  
  // parametri inseriti dall utente
  const [params, setParams] = useState(props.params)

  const handleSetWorkspace = () => {
    setWorkspaceState(Blockly.serialization.workspaces.save(primaryWorkspace.current))
  }

  const handleSetParams = () => {
    setParams(props.params)
  }

  const handleSetFunctionValue = (value) => {
    setFunctionValue(value)
    console.log(value)
    //  hard coded values for testing purpose
    value = {
      name: 'function name',
      id: '12345',
      category: 'restrictions',
      params: [
        {
          name: 'param_1'
        },
        {
          name: 'param_2'
        },
        {
          name: 'param_3'
        },
        {
          name: 'param_4'
        },
      ]
    }

    let block = primaryWorkspace.current.getBlockById(callFunctionBlock.current)
    Blockly.Events.fire(
      new Blockly.Events.BlockChange(
        block, 'field', 'input', block.getFieldValue('input'), value // da cambiare con functionValue
      ))
  }

  useImperativeHandle(ref, () => ({
    handleSave() {
      handleSetWorkspace()
      console.log('oggetto => ', workspaceState, 'stringify => ', JSON.stringify(workspaceState))
      return workspaceState
    }
  }));

  useEffect(() => {

    handleSetParams()

    if (router.isReady && primaryWorkspace.current && params) {
      params.forEach((o) => {
        Blockly.Variables.getOrCreateVariablePackage(primaryWorkspace.current, null, o.name, null)
      })
    }

  }, [props.params, router.isReady])

  useEffect(() => {
    if (router.isReady && !primaryWorkspace.current) {
      // Check if primaryWorkspace is already initialized
      primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
        toolbox: toolbox.current,
      });

      // la funzione Load carica nell' attuale workspace 
      // uno precedentemente salvato e recuperato tramite Api
      if (workspaceState) {
        Blockly.serialization.workspaces.load(props.state, primaryWorkspace.current);
      }
      if(props.onSave){
        props.onSave(Blockly.serialization.workspaces.save(primaryWorkspace.current));
      } 

      primaryWorkspace.current.addChangeListener(
        shadowBlockConversionChangeListener,
      );

      // listener per evento custom per aprire il modale
      primaryWorkspace.current.addChangeListener((e) => {
        console.log(Blockly.serialization.workspaces.save(primaryWorkspace.current));
        if (e.type === Blockly.Events.CLICK && e.targetType === Blockly.Events.ClickTarget.OPEN_MODAL) {
          // copia l'id del blocco scatenante l'evento da riutilizzare in seguito
          callFunctionBlock.current = e.blockId
          // apri modale
          SetmodalFunction(true)
        }
      })
    }
  }, [router.isReady]);

  return (
    <>
      {modalFunction &&
        <SelectFunction
          opened={true}
          toggle={() => SetmodalFunction(!modalFunction)}
          setFunction={(value) => handleSetFunctionValue(value)}
        />}
      {/* da eliminare */}
      <button onClick={() => SetmodalFunction(!modalFunction)}>open modal</button>
      <div
        id="blocklyDiv"
        ref={blocklyDiv}
        style={{ height: "70vh", width: "100%" }}
      />
    </>
  );
});

export default Editor;
