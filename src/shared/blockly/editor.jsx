import React, { useRef, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Blockly from "blockly";
import { shadowBlockConversionChangeListener } from "@blockly/shadow-block-converter";
import { CrossTabCopyPaste } from "@blockly/plugin-cross-tab-copy-paste";
import {
	Multiselect,
	MultiselectBlockDragger,
} from "./multiselect";
import { ZoomToFitControl } from "@blockly/zoom-to-fit";
import { toolboxJson } from "@/lib/blockly/toolbox";
import SelectFunction from "./select-function";
import { initCustomBlocks } from "@/lib/blockly/erp-custom-blocks";
import _ from "lodash";
import { message, notification } from "antd";

const Editor = ({ state, params, onSave, onValidate, toolboxType = "standard" }) => {
	const router = useRouter();
	initCustomBlocks();
	const [modalFunction, setModalFunction] = useState(false);
	const [selectedFunction, setSelectedFunction] = useState(null);
	const blocklyDiv = useRef(null); // Initialize with null
	const toolbox = useRef(toolboxJson(toolboxType));
	const primaryWorkspace = useRef();
	const copyPastePlugin = useRef();
	const callFunctionBlock = useRef();
	const workspaceState = useRef(null);
	const [api, contextHolder] = notification.useNotification();

	// parametri inseriti dall utente
	const [oldParams, setOldParams] = useState();
	const [newParams, setNewParams] = useState();
	const [variables, setVariables] = useState([]);

	const handleSave = () => {
		let saving = Blockly.serialization.workspaces.save(primaryWorkspace.current);

		// check if saved succesfully and onSave prop present
		if (!_.isEmpty(saving) && onSave) {
			// send back workspace data
			onSave(saving);
			// set flag for avoid loading loop
			workspaceState.current = true;
			console.log(saving);
			//check for empty values and validate workspace
			onValidate(primaryWorkspace.current.allInputsFilled(true));
		}
	};

	const handleSetFunctionValue = (value) => {
		// get function block by id
		let block = primaryWorkspace.current.getBlockById(callFunctionBlock.current);
		// fire event change for set text and arguments for function block
		Blockly.Events.fire(
			new Blockly.Events.BlockChange(
				block,
				"field",
				"input",
				block.getFieldValue("input"),
				value
			)
		);
	};

	const handleSetVariables = (value) => {
		setVariables(value);
	};

	useEffect(() => {
		// Check if primaryWorkspace is initialized or initialize it
		if (router.isReady && !primaryWorkspace.current) {
			primaryWorkspace.current = Blockly.inject(blocklyDiv.current, {
				toolbox: toolbox.current,
				zoom: {
					controls: true,
				},
				// blockDragger: MultiselectBlockDragger,
			});

			try {
				Blockly.ContextMenuRegistry.registry.unregister("blockCopyToStorage");
				Blockly.ContextMenuRegistry.registry.unregister("blockPasteFromStorage");
			} catch (e) {}
			const options = {
				contextMenu: true,
				shortcut: true,
			};
			// if (!copyPastePlugin.current) {
			// 	copyPastePlugin.current = new CrossTabCopyPaste();
			// 	copyPastePlugin.current.init(options, () => {
			// 		console.log("Use this error callback to handle TypeError while pasting");
			// 	});
			// }
			// Initialize plugin.
			const zoomToFit = new ZoomToFitControl(primaryWorkspace.current);
			zoomToFit.init();

			const optionsMultiSel = {
				// Double click the blocks to collapse/expand
				// them (A feature from MIT App Inventor).
				useDoubleClick: false,
				// Bump neighbours after dragging to avoid overlapping.
				bumpNeighbours: false,

				// Use custom icon for the multi select controls.
				multiselectIcon: {
					hideIcon: true,
					enabledIcon:
						"https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/select.svg",
					disabledIcon:
						"https://github.com/mit-cml/workspace-multiselect/raw/main/test/media/unselect.svg",
				},

				multiselectCopyPaste: {
					// Enable the copy/paste accross tabs feature (true by default).
					crossTab: true,
					// Show the copy/paste menu entries (true by default).
					menu: true,
				},
			};
			const multiselectPlugin = new Multiselect(primaryWorkspace.current);
			multiselectPlugin.init(optionsMultiSel);
			// listener for transform shadow blocks to actual blocks
			primaryWorkspace.current.addChangeListener(shadowBlockConversionChangeListener);
			// general workspace event listener
			primaryWorkspace.current.addChangeListener((e) => {
				//save and return workspace state to Parent component
				handleSave();
				// set params with passed values
				if (params) {
					setNewParams(params());
				}
				// check for custom event OPEN_MODAL
				if (
					e.type === Blockly.Events.CLICK &&
					e.targetType === Blockly.Events.ClickTarget.OPEN_MODAL
				) {
					console.log(primaryWorkspace.current.getBlockById(e.blockId).functionId_);
					// copia l'id del blocco scatenante l'evento da riutilizzare in seguito
					callFunctionBlock.current = e.blockId;
					setSelectedFunction(
						primaryWorkspace.current.getBlockById(e.blockId).functionId_
					);

					// apri modale
					setModalFunction(true);
				}
			});
			// Event listener to handle last body changes
			document.getElementById("blocklyDiv").addEventListener("focusout", (e) => {
				handleSave();
			});
		}
	}, [router.isReady]);

	// callback load
	useEffect(() => {
		if (primaryWorkspace.current && !workspaceState.current && state) {
			try {
				Blockly.serialization.workspaces.load(state, primaryWorkspace.current);
			} catch (error) {
				Blockly.serialization.workspaces.load({}, primaryWorkspace.current);
				// api.warning({
				//   message: "There is an error loading the workspace!",
				//   // description: `${el}`,
				//   placement: "top",
				//   duration: 0,
				// })
				message.error(
					"There was an error during the initialization of the workspace! ",
					10
				);
			}
		}
	}, [state]);

	// on change of form arguments set params
	useEffect(() => {
		// check for  differences in passed arguments
		let diffParams = _.difference(_.map(oldParams, "name"), _.map(newParams, "name"));

		// remove variable if deleted or changed
		if (!_.isEmpty(diffParams)) {
			_.each(diffParams, (el) => {
				let variable = _.find(variables, (o) => o.name === el);
				primaryWorkspace.current.deleteVariableById(variable.id_);
			});
		}

		// create new variable if not exists or get the existing ones
		let localVars = [];
		if (!_.isEmpty(newParams)) {
			newParams.forEach((o) => {
				localVars.push(
					Blockly.Variables.getOrCreateVariablePackage(
						primaryWorkspace.current,
						null,
						o.name,
						null
					)
				);
			});

			// set oldParams for comparision
			setOldParams(newParams);
			// set variables with updated ones
			handleSetVariables(localVars);
		}
	}, [newParams]);

	return (
		<>
			{modalFunction && (
				<SelectFunction
					opened={true}
					toggle={() => setModalFunction(!modalFunction)}
					setFunction={(value) => handleSetFunctionValue(value)}
					func={selectedFunction}
				/>
			)}

			<div
				id="blocklyDiv"
				ref={blocklyDiv}
				style={{ height: "70vh", width: "100%" }}
			/>
		</>
	);
};

export default Editor;
