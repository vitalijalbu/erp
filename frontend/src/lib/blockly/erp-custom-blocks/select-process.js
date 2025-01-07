import Blockly from "blockly";
import { ProcessesAutocomplete } from "./custom-fields/processes-autocomplete.js";

export const initSelectProcess = () => {
	Blockly.Blocks["select_process"] = {
		options: [],

		init: function () {
			this.appendDummyInput("Select").appendField(
				new ProcessesAutocomplete("", this.options),
				"Process"
			);
			this.setOutput(true, "select_process");
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setColour("#56AD4B");
			this.setTooltip("Comment");
			this.setHelpUrl("");
		},

		/**
		 * Returns the state of this block as a JSON serializable object.
		 * @returns {{itemCount: number}} The state of this block, ie the item count.
		 */
		saveExtraState: function () {
			// console.log(this.getField("Feature")?.textContent_)
			return {
				// itemCount: this.itemCount_,
				opt: [
					this.getFieldValue("Process"),
					this.getField("Process")?.textContent_?.nodeValue,
				],
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.options = state["opt"];
			this.updateShape_();
		},

		updateShape_: function () {
			console.log("dd", this.options);
			this.removeInput("Select");
			this.appendDummyInput("Select").appendField(
				new ProcessesAutocomplete(this.options[0], this.options),
				"Process"
			);
		},
	};
};
