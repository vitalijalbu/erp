import { initFetchDbBlock } from "@/lib/blockly/erp-custom-blocks/fetch-from-db";
import { initPairValueBlock } from "@/lib/blockly/erp-custom-blocks/pair-value";
import { initExecuteSqlBlock } from "@/lib/blockly/erp-custom-blocks/execute-sql";
import { initJsonBlock } from "@/lib/blockly/erp-custom-blocks/json";
import { initRunCmd } from "@/lib/blockly/erp-custom-blocks/run-cmd";
import { initDebugBlock } from "@/lib/blockly/erp-custom-blocks/debug";
import { initReturnBlock } from "@/lib/blockly/erp-custom-blocks/return";
import { initCallFunctionBlock } from "@/lib/blockly/erp-custom-blocks/call-function";
import { initGetFeatureBlock } from "@/lib/blockly/erp-custom-blocks/get-feature";
import { initSetFeatureBlock } from "@/lib/blockly/erp-custom-blocks/set-feature";
import { initEnableFeatureBlock } from "@/lib/blockly/erp-custom-blocks/enable-feature";
import { initValidateFeatureBlock } from "@/lib/blockly/erp-custom-blocks/validate-feature";
import { initInvalidateFeatureBlock } from "@/lib/blockly/erp-custom-blocks/invalidate-feature";
import { initShowMessageBlock } from "./show-message";
import { initApplyDataSetBlock } from "./apply-dataset";
import { initDatasetDataBlock } from "./dataset-data";
import { initDatasetBlock } from "./dataset";
import { initGlobalCompanyBlock } from "./global-company";
import { initGlobalUserBlock } from "./global-user";
import { initGetIndexesBlock } from "./get-index";
import { initCommentBlock } from "./comment";
import { initGlobalBusinessPartnerBlock } from "./global-business-partner";
import { initCheckFeatureBlock } from "./check-value";
import { initSetFeatureDefaultBlock } from "./set-feature-default";
import { initGlobalStandardProduct } from "./global-cur-stan-prod";
import { initSelectFeature } from "./select-feature";
import { initNewLineBlock } from "./new-line";
import { initAddItemBlock } from "./add-item";
import { initSelectProcess } from "./select-process";
import { initMathRoundBlock } from "./math_round"
import { initSwitch } from "./switch";
import { initSwitchMutator } from "./mutator-blocks/switch-mutator";
import { initEnableCurrentOp } from "./enable-current-op";
import { initApplyPriceBlock } from "./apply-price";

// import { initMachineTimeBlock } from "./machine-workload";
// import { initOperatorTimeBlock } from "./operator-workload";


export const initCustomBlocks = () => {
	initFetchDbBlock();
	initPairValueBlock();
	initExecuteSqlBlock();
	initJsonBlock();
	initRunCmd();
	initDebugBlock();
	initReturnBlock();
	initCallFunctionBlock();
	initGetFeatureBlock();
	initSetFeatureBlock();
	initEnableFeatureBlock();
	initValidateFeatureBlock();
	initInvalidateFeatureBlock()
	initShowMessageBlock();
	initApplyDataSetBlock();
	initDatasetDataBlock();
	initDatasetBlock();
	initGlobalCompanyBlock();
	initGlobalUserBlock();
	initGetIndexesBlock();
	initCommentBlock();
	initGlobalBusinessPartnerBlock();
	initCheckFeatureBlock();
	initSetFeatureDefaultBlock();
	initGlobalStandardProduct()
	initSelectProcess()
	initSelectFeature()
	initNewLineBlock()
	initAddItemBlock()
	initMathRoundBlock()
	initSwitchMutator()
	initSwitch()
	initEnableCurrentOp()
	initApplyPriceBlock();
	// initMachineTimeBlock()
	// initOperatorTimeBlock()
}