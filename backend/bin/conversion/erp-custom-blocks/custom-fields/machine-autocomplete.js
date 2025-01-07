import Blockly from "blockly";
import { dataMachines } from "../hooks/helper.js";

export class MachineAutocomplete extends Blockly.FieldTextInput {
	/**
	 * All pitches available for the picker.
	 */

	static DATA = {};
	static ITEMS = [];
	static init = false;
	static loadPromise = null;

	/**
	 * Array holding info needed to unbind events.
	 * Used for disposing.
	 * @type {!Array<!Blockly.browserEvents.Data>}
	 * @private
	 */
	boundEvents_ = [];

	constructor(text, opts) {
		super(text);
		// Disable spellcheck.
		this.setSpellcheck(false);
		this.loadData().then((data) => {
			if (data.length > 0) {
				MachineAutocomplete.DATA = Object.fromEntries(data);
			} else {
				MachineAutocomplete.DATA = Object.fromEntries([opts]);
			}
			try {
				let value = this.getValue();
				this.setValue(value);
				if(value && MachineAutocomplete.DATA[value]) {
					this.textContent_.nodeValue = MachineAutocomplete.DATA[value];
					this.forceRerender();
				}
			} catch (error) {
				console.log(error);
			}
		});
		
	}

	loadData() {
		if(!MachineAutocomplete.init) {
			MachineAutocomplete.init = true;
			MachineAutocomplete.loadPromise = new Promise((resolve, reject) => {
				dataMachines().then((data) => {
					resolve(data);
				});
			});
		}
		return MachineAutocomplete.loadPromise;
	}

	/**
	 * Construct a MachineAutocomplete from a JSON arg object.
	 * @param {!Object} options A JSON object with options (pitch).
	 * @returns {!MachineAutocomplete} The new field instance.
	 * @package
	 * @nocollapse
	 */
	static fromJson(options) {
		// `this` might be a subclass of MachineAutocomplete if that class doesn't
		// override the static fromJson method.
		return new this(options["pitch"]);
	}

	/**
	 * Show the inline free-text editor on top of the text and the pitch picker.
	 * @protected
	 */
	showEditor_() {
		super.showEditor_();

		const div = Blockly.WidgetDiv.getDiv();
		if (!div.firstChild) {
			// Mobile interface uses Blockly.dialog.setPrompt().
			return;
		}
		// Build the DOM.
		const editor = this.dropdownCreate_();
		Blockly.DropDownDiv.getContentDiv().appendChild(editor);

		/*
		Blockly.DropDownDiv.setColour(
			this.sourceBlock_.style.colourPrimary,
			this.sourceBlock_.style.colourTertiary
		);
		*/

		Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));

		// The pitch picker is different from other fields in that it updates on
		// mousemove even if it's not in the middle of a drag.  In future we may
		// change this behaviour.  For now, using `bind` instead of
		// `conditionalBind` allows it to work without a mousedown/touchstart.
		// this.boundEvents_.push(
		// 	// Blockly.browserEvents.bind(this.imageElement_, "click", this, this.hide_)
		// );
		this.boundEvents_.push(
			Blockly.browserEvents.bind(this.imageElement_, "mousemove", this, this.onMouseMove)
		);

		this.updateGraph_();
	}

	/**
	 * Create the pitch picker.
	 * @returns {!Element} The newly created pitch picker.
	 * @private
	 */
	dropdownCreate_() {
		this.imageElement_ = document.createElement("div");
		this.imageElement_.id = "notePicker";

		MachineAutocomplete.ITEMS = MachineAutocomplete.DATA;
		var optionsLength = MachineAutocomplete.DATA.length;
		var height = 24.4 * optionsLength;
		this.imageElement_.style =
			// "height:300px;"
			"width: 200px;size: 12px;padding: 2px;";

		let listItem = document.createElement("ul");
		listItem.style = "margin:0; padding:0;";
		for (let el in MachineAutocomplete.ITEMS) {
			let item = document.createElement("li");
			item.style = "cursor:pointer;padding:5px;list-style-type:none";
			item.classList.add("blocklySelectionItem");
			item.addEventListener("click", (e) => {
				e.preventDefault;
				e.stopPropagation;
				this.setEditorValue_(el);
				this.hide_();
			});
			item.innerHTML = MachineAutocomplete.ITEMS[el];
			listItem.appendChild(item);
		}
		this.imageElement_.appendChild(listItem);
		return this.imageElement_;
	}

	/**
	 * Dispose of events belonging to the pitch picker.
	 * @private
	 */
	dropdownDispose_() {
		for (const event of this.boundEvents_) {
			Blockly.browserEvents.unbind(event);
		}
		this.boundEvents_.length = 0;
		this.imageElement_ = null;
	}

	/**
	 * Hide the editor and picker.
	 * @private
	 */
	hide_() {
		Blockly.WidgetDiv.hide();
		Blockly.DropDownDiv.hideWithoutAnimation();
	}

	/**
	//  * Set the note to match the mouse's position.
	//  * @param {!Event} e Mouse move event.
	//  */
	onMouseMove(e) {
		// 	const bBox = this.imageElement_.getBoundingClientRect();
		// 	const dy = e.clientY - bBox.top;
		// 	var highLight = Array.from(MachineAutocomplete.ITEMS);
		// 	var note =
		// 		Math.round((dy - 5) / 24.5) < highLight.length ? Math.round((dy - 5) / 24.5) : -1;
		// 	if (note != -1) highLight[note] = "<font color='white'>" + highLight[note] + "</font>";
		// 	this.imageElement_.innerHTML = highLight.join("<br>");
		// 	this.setEditorValue_(note);
	}

	/**
	 * Convert the machine-readable value (0-12) to human-readable text (C3-A4).
	 * @param {number|string} value The provided value.
	 * @returns {string|undefined} The respective pitch, or undefined if invalid.
	 */
	valueToNote(value) {
		// if (MachineAutocomplete.ITEMS && MachineAutocomplete.ITEMS.length > 0) {
		return MachineAutocomplete.DATA[value] ?? "";
		// } else return "";
	}

	/**
	 * Convert the human-readable text (C3-A4) to machine-readable value (0-12).
	 * @param {string} text The provided pitch.
	 * @returns {number|undefined} The respective value, or undefined if invalid.
	 */
	noteToValue(text) {
		var normalizedText = text.trim();
		var i = _.map(MachineAutocomplete.DATA, (v, k) => v).indexOf(normalizedText);
		MachineAutocomplete.ITEMS = [];
		var words = MachineAutocomplete.ITEMS;
		var initwords = Object.values(MachineAutocomplete.DATA);
		for (var j = 0; j < initwords.length; j++) {
			if (
				initwords[j].toUpperCase().indexOf(normalizedText.toUpperCase()) != -1 ||
				normalizedText == ""
			)
				words.push(initwords[j]);
		}
		if (MachineAutocomplete.ITEMS.length == 0)
			words.push(["No result found! Try change keyword."]);
		var optionsLength = MachineAutocomplete.DATA.length;
		var height = 24.4 * optionsLength + 1;
		// this.imageElement_.style.height = height + 'px; top:' + this.imageElement_.offsetHeight + 'px'
		let listItem = document.createElement("ul");
		listItem.style = "margin:0; padding:0; ";
		for (let el in MachineAutocomplete.ITEMS) {
			let item = document.createElement("li");
			item.style = "cursor:pointer;padding:5px;list-style-type:none";
			item.classList.add("blocklySelectionItem");
			item.addEventListener("click", (e) => {
				e.preventDefault;
				e.stopPropagation;
				this.setEditorValue_(
					_.findKey(MachineAutocomplete.DATA, (o) => o === e.target.innerHTML)
				);
				this.hide_();
			});
			item.innerHTML = MachineAutocomplete.ITEMS[el];
			listItem.appendChild(item);
		}
		this.imageElement_.replaceChildren(listItem);

		Blockly.DropDownDiv.showPositionedByField(this, this.dropdownDispose_.bind(this));

		return i > -1 ? 0 : -1;
	}

	/**
	 * Get the text to be displayed on the field node.
	 * @returns {?string} The HTML value if we're editing, otherwise null.
	 * Null means the super class will handle it, likely a string cast of value.
	 * @protected
	 */
	getText_() {
		if (this.isBeingEdited_) {
			return super.getText_();
		}
		return this.valueToNote(this.getValue()) || null;
	}

	/**
	 * Transform the provided value into a text to show in the HTML input.
	 * @param {*} value The value stored in this field.
	 * @returns {string} The text to show on the HTML input.
	 */
	getEditorText_(value) {
		return this.valueToNote(value);
	}

	/**
	 * Transform the text received from the HTML input (note) into a value
	 * to store in this field.
	 * @param {string} text Text received from the HTML input.
	 * @returns {*} The value to store.
	 */
	getValueFromEditorText_(text) {
		return this.noteToValue(text);
	}

	/**
	 * Updates the graph when the field rerenders.
	 * @private
	 * @override
	 */
	render_() {
		super.render_();
		this.updateGraph_();
	}

	/**
	 * Redraw the pitch picker with the current pitch.
	 * @private
	 */
	updateGraph_() {
		if (!this.imageElement_) {
			return;
		}
		const i = this.getValue();
	}

	/**
	 * Ensure that only a valid value may be entered.
	 * @param {*} opt_newValue The input value.
	 * @returns {*} A valid value, or null if invalid.
	 */
	doClassValidation_(opt_newValue) {
		return opt_newValue;
		if (opt_newValue === null || opt_newValue === undefined) {
			return null;
		}
		const note = this.valueToNote(opt_newValue);
		if (note) {
			return opt_newValue;
		}
		return null;
	}
}
try {
	Blockly.fieldRegistry.register("machine_autocomplete", MachineAutocomplete);
} catch (e) {}
