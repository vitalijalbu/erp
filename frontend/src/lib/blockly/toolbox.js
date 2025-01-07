import _ from "lodash";

export const toolboxJson = (toolboxType = null) => {
	const standardToolbox = toolboxType === "standard";
	const bomToolbox = toolboxType === "bom";
	const routingToolbox = toolboxType === "routing";
	const pricingToolbox = toolboxType === "pricing";

	const logicCategory = {
		kind: "category",
		name: "Logic",
		contents: [
			{
				kind: "block",
				type: "controls_if",
			},
			{
				kind: "block",
				type: "controls_ifelse",
			},
			{
				kind: "block",
				type: "switch",
			},
			{
				kind: "block",
				type: "logic_compare",
			},
			{
				kind: "block",
				type: "logic_operation",
			},
			{
				kind: "block",
				type: "logic_negate",
			},
			{
				kind: "block",
				type: "logic_boolean",
			},
			{
				kind: "block",
				type: "logic_null",
			},
			{
				kind: "block",
				type: "logic_ternary",
			},
		],
		categorystyle: "logic_category",
	};

	const loopCategory = {
		kind: "category",
		name: "Loops",
		contents: [
			{
				kind: "block",
				type: "controls_repeat_ext",
				inputs: {
					TIMES: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "10",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "controls_whileUntil",
			},
			{
				kind: "block",
				type: "controls_for",
				inputs: {
					FROM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
					TO: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "10",
							},
						},
					},
					BY: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "controls_forEach",
			},
			{
				kind: "block",
				type: "controls_flow_statements",
			},
		],
		categorystyle: "loop_category",
	};

	const mathCategory = {
		kind: "category",
		name: "Math",
		contents: [
			{
				kind: "block",
				type: "math_number",
				fields: {
					NUM: "123",
				},
			},
			{
				kind: "block",
				type: "math_arithmetic",
				inputs: {
					A: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
					B: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_single",
				inputs: {
					NUM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "9",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_trig",
				inputs: {
					NUM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "45",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_constant",
			},
			{
				kind: "block",
				type: "math_number_property",
				inputs: {
					NUMBER_TO_CHECK: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "0",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_round",
				inputs: {
					NUM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "3.1",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_on_list",
			},
			{
				kind: "block",
				type: "math_modulo",
				inputs: {
					DIVIDEND: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "64",
							},
						},
					},
					DIVISOR: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "10",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_constrain",
				inputs: {
					VALUE: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "50",
							},
						},
					},
					LOW: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
					HIGH: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "100",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_random_int",
				inputs: {
					FROM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
					TO: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "100",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "math_random_float",
			},
			{
				kind: "block",
				type: "math_atan2",
				inputs: {
					X: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
					Y: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "1",
							},
						},
					},
				},
			},
		],
		categorystyle: "math_category",
	};

	const textCategory = {
		kind: "category",
		name: "Text",
		contents: [
			{
				kind: "block",
				type: "text",
			},
			{
				kind: "BLOCK",
				type: "text_multiline",
			},
			{
				kind: "BLOCK",
				type: "new_line",
			},
			{
				kind: "block",
				type: "text_join",
			},
			{
				kind: "block",
				type: "text_append",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_length",
				inputs: {
					VALUE: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_isEmpty",
				inputs: {
					VALUE: {
						shadow: {
							type: "text",
							fields: {
								TEXT: null,
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_indexOf",
				inputs: {
					VALUE: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{textVariable}",
							},
						},
					},
					FIND: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_charAt",
				inputs: {
					VALUE: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{textVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_getSubstring",
				inputs: {
					STRING: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{textVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_changeCase",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_trim",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_print",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "text_prompt_ext",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "abc",
							},
						},
					},
				},
			},
			{
				type: "text_count",
				kind: "block",
				inputs: {
					SUB: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
				},
			},
			{
				type: "text_replace",
				kind: "block",
				inputs: {
					FROM: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
					TO: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
				},
			},
			{
				type: "text_reverse",
				kind: "block",
				inputs: {
					TEXT: {
						shadow: {
							type: "text",
							fields: {
								TEXT: "",
							},
						},
					},
				},
			},
		],
		categorystyle: "text_category",
	};
	const listCategory = {
		kind: "category",
		name: "Lists",
		contents: [
			{
				kind: "block",
				type: "lists_create_with",
				extraState: {
					itemCount: "0",
				},
			},
			{
				kind: "block",
				type: "lists_create_with",
			},
			{
				kind: "block",
				type: "lists_repeat",
				inputs: {
					NUM: {
						shadow: {
							type: "math_number",
							fields: {
								NUM: "5",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_length",
			},
			{
				kind: "block",
				type: "lists_isEmpty",
			},
			{
				kind: "block",
				type: "lists_indexOf",
				inputs: {
					VALUE: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{listVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_getIndex",
				inputs: {
					VALUE: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{listVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_setIndex",
				inputs: {
					LIST: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{listVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_getSublist",
				inputs: {
					LIST: {
						block: {
							type: "variables_get",
							fields: {
								VAR: "{listVariable}",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_split",
				inputs: {
					DELIM: {
						shadow: {
							type: "text",
							fields: {
								TEXT: ",",
							},
						},
					},
				},
			},
			{
				kind: "block",
				type: "lists_sort",
			},
		],
		categorystyle: "list_category",
	};

	const variableCategory = {
		kind: "category",
		name: "Variables",
		contents: [
			{
				kind: "block",
				type: "get_index",
			},
		],
		custom: "VARIABLE",
		categorystyle: "variable_category",
	};

	const typedVariablesCategory = {
		kind: "category",
		name: "TypedVariables",
		contents: [
			{
				kind: "block",
				type: "get_index",
			},
			{
				kind: "block",
				type: "pair_value",
			},
			{
				kind: "block",
				type: "json",
			},
			{
				kind: "block",
				type: "dataset",
			},
		],
		colour: "70",
	};

	const globalVarCategory = {
		kind: "category",
		name: "Global Variables",
		categorystyle: "text_category",
		contents: [
			{
				kind: "block",
				type: "global_user_id",
			},
			{
				kind: "block",
				type: "global_user_company",
			},
			{
				kind: "block",
				type: "global_business_partner",
			},
			{
				kind: "block",
				type: "global_st_product",
			},
			{
				kind: "block",
				type: "global_current_date",
			},
			{
				kind: "block",
				type: "global_current_row_qty",
			},
		],
	};
	const functionCategory = {
		kind: "category",
		name: "Functions",
		contents: [
			{
				kind: "block",
				type: "call_function",
			},
			{
				kind: "block",
				type: "return",
			},
		],
		// "custom": "PROCEDURE",
		categorystyle: "procedure_category",
	};

	const dbCategory = {
		kind: "category",
		name: "Interact With DB",
		categorystyle: "loop_category",
		contents: [
			{
				kind: "block",
				type: "fetch_from_db",
			},
			{
				kind: "block",
				type: "execute_sql",
			},
		],
	};

	const getFeatureBlocks = [
		{
			kind: "block",
			type: "get_feature",
			position: 1,
		},
		{
			kind: "block",
			type: "check_feature",
			position: 3,
		},
	];

	const setFeatureBlocks = [
		{
			kind: "block",
			type: "set_feature",
			position: 2,
		},

		{
			kind: "block",
			type: "set_feature_default",
			position: 4,
		},
		{
			kind: "block",
			type: "enable_feature",
			position: 5,
		},
		{
			kind: "block",
			type: "validate_feature",
			position: 6,
		},
		{
			kind: "block",
			type: "invalidate_feature",
			position: 7,
		},
		{
			kind: "block",
			type: "apply_dataset",
			position: 8,
		},
	];

	const featuresCategory = {
		kind: "category",
		name: "Interact With Feature",
		categorystyle: "colour_category",
		contents: _.sortBy(
			_.concat(getFeatureBlocks, standardToolbox ? setFeatureBlocks : []),
			"position"
		),
	};

	const scriptedCategory = {
		kind: "category",
		name: "Scripted Blocks",
		categorystyle: "logic_category",
		contents: [
			{
				kind: "block",
				type: "run_cmd",
			},
		],
	};

	const helperCategory = {
		kind: "category",
		name: "Helper Blocks",
		categorystyle: "math_category",
		contents: [
			{
				kind: "block",
				type: "debug",
			},
			{
				kind: "block",
				type: "show_message",
			},
			{
				kind: "block",
				type: "comment",
			},
			{
				kind: "block",
				type: "date_format",
			},
		],
	};

	const bomCategory = {
		kind: "category",
		name: "Bom",
		categorystyle: "math_category",
		hidden: String(!bomToolbox),
		contents: [
			{
				kind: "block",
				type: "add_item",
			},
		],
	};
	const routingCategory = {
		kind: "category",
		name: "Routing",
		categorystyle: "text_category",
		hidden: String(!routingToolbox),
		contents: [
			{
				kind: "block",
				type: "enable_current_op",
			},
			// {
			// 	kind: "block",
			// 	type: "machine_workload",
			// },
			// {
			// 	kind: "block",
			// 	type: "operator_workload",
			// },
		],
	};
	const pricingCategory = {
		kind: "category",
		name: "Pricing",
		categorystyle: "text_category",
		hidden: String(!pricingToolbox),
		contents: [
			{
				kind: "block",
				type: "apply_price",
			},
		],
	};
	return {
		kind: "categoryToolbox",
		contents: [
			logicCategory,
			loopCategory,
			mathCategory,
			textCategory,
			listCategory,
			{
				kind: "sep",
			},
			variableCategory,
			typedVariablesCategory,
			globalVarCategory,
			{
				kind: "sep",
			},
			functionCategory,
			dbCategory,
			featuresCategory,
			bomCategory,
			routingCategory,
			pricingCategory,
			scriptedCategory,
			{
				kind: "sep",
			},
			helperCategory,
		],
	};
};
