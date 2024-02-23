import phpGenerator from "blockly/php.js";
import Blockly from "blockly";


import { initFetchDbBlock } from './erp-custom-blocks/fetch-from-db.js';
import { initPairValueBlock } from './erp-custom-blocks/pair-value.js';
import { initReturnBlock } from './erp-custom-blocks/return.js';
import { initRunCmd } from './erp-custom-blocks/run-cmd.js';
import { initDebugBlock } from './erp-custom-blocks/debug.js';
import { initJsonBlock } from './erp-custom-blocks/json.js';
import { initExecuteSqlBlock } from './erp-custom-blocks/execute-sql.js';
import { initCallFunctionBlock } from './erp-custom-blocks/call-function.js';
import { initGetFeatureBlock } from './erp-custom-blocks/get-feature.js';
import { initSetFeatureBlock } from './erp-custom-blocks/set-feature.js';
import { initValidateFeatureBlock } from './erp-custom-blocks/validate-feature.js';
import { initInvalidateFeatureBlock } from './erp-custom-blocks/invalidate-feature.js';
import { initEnableFeatureBlock } from './erp-custom-blocks/enable-feature.js';
import { initDatasetBlock } from './erp-custom-blocks/dataset.js';
import { initDatasetDataBlock } from './erp-custom-blocks/dataset-data.js';
import { initApplyDataSetBlock } from './erp-custom-blocks/apply-dataset.js';
import { initShowMessageBlock } from './erp-custom-blocks/show-message.js';
import { initGlobalUserBlock } from './erp-custom-blocks/global-user.js'
import { initGlobalCompanyBlock } from './erp-custom-blocks/global-company.js'
import { initGlobalBusinessPartnerBlock } from './erp-custom-blocks/global-business-partner.js'
import { initGetIndexesBlock } from './erp-custom-blocks/get-index.js'
import { initCommentBlock } from './erp-custom-blocks/comment.js'
import { initCheckFeatureBlock } from './erp-custom-blocks/check-value.js'
import { initSetFeatureDefaultBlock } from './erp-custom-blocks/set-feature-default.js'
import { initGlobalStandardProduct } from './erp-custom-blocks/global-cur-stan-prod.js'
import { initNewLineBlock } from './erp-custom-blocks/new-line.js'
import { initSelectProcess } from './erp-custom-blocks/select-process.js';
import { initAddItemBlock } from './erp-custom-blocks/add-item.js'
import { initMathRoundBlock } from './erp-custom-blocks/math_round.js'
import { initSwitch } from './erp-custom-blocks/switch.js'
import { initEnableCurrentOp } from './erp-custom-blocks/enable-current-op.js'
import { initApplyPriceBlock } from './erp-custom-blocks/apply-price.js'
import { initDateFormatBlock } from './erp-custom-blocks/date-format.js'
import { initGlobalDateBlock } from './erp-custom-blocks/global- current-date.js'
import { initGlobalCurrentRowQty } from './erp-custom-blocks/global- row-qty.js';

initFetchDbBlock();
initPairValueBlock();
initReturnBlock();
initRunCmd();
initDebugBlock();
initJsonBlock();
initExecuteSqlBlock();
initCallFunctionBlock();
initGetFeatureBlock();
initSetFeatureBlock();
initValidateFeatureBlock();
initInvalidateFeatureBlock();
initEnableFeatureBlock();
initDatasetDataBlock();
initDatasetBlock();
initApplyDataSetBlock();
initShowMessageBlock();
initGlobalUserBlock();
initGlobalCompanyBlock();
initGlobalBusinessPartnerBlock();
initGetIndexesBlock();
initCommentBlock();
initCheckFeatureBlock();
initSetFeatureDefaultBlock();
initGlobalStandardProduct();
initNewLineBlock();
initSelectProcess();
initAddItemBlock();
initMathRoundBlock();
initSwitch();
initEnableCurrentOp();
initApplyPriceBlock();
initDateFormatBlock();
initGlobalDateBlock();
initGlobalCurrentRowQty();

const generator = phpGenerator.phpGenerator;

function escapeString(string) {
    return JSON.stringify(string);
}


generator.forBlock['comment'] = function(block) {
    var code = '';
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    return code;
};

generator.forBlock['fetch_from_db'] = function(block) {
    var values = []
    var query = block.getFieldValue('query').trim()

    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD_' + this.newValues_[i];
        values.push(generator.valueToCode(block, current, generator.ORDER_NONE) || 'null');
    }

    var option = generator.nameDB_.getName(block.getFieldValue('option'))

    var code = `\\App\\Database\\DB::fetch(${escapeString(query)}, "${option}", [${values.join(', ')}])`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['execute_sql'] = function(block) {
    var values = []
    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD' + i;
        values.push(generator.valueToCode(block, current, generator.ORDER_NONE) || 'null');
    }

    var query = block.getFieldValue('query').trim()

    var code = `\\App\\Database\\DB::exec(${escapeString(query)}, [${values.join(', ')}])`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['pair_value'] = function(block) {
    var code;
    var name = escapeString(block.getFieldValue('NAME').replaceAll('"', '\\"'));
    var value = generator.valueToCode(block, 'Value', generator.ORDER_NONE) || null;
    code = `${name} => ${value},`
    return [code, generator.ORDER_NONE];
};

generator.forBlock['return'] = function(block) {
    var code;
    var value = generator.valueToCode(block, 'RETURN', generator.ORDER_NONE) || null;
    code = `return ${value}`;
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;
};

generator.forBlock['run_cmd'] = function(block) {
    var code = 'null';
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;
};

generator.forBlock['debug'] = function(block) {
    var code;
    var value = generator.valueToCode(block, 'DEBUG', generator.ORDER_NONE) || 'null';
    var comment = block.getFieldValue('COMMENT') || null;
    comment = comment ? escapeString(comment) : 'null';
    code = `\\App\\Debug\\Debug::dump(${value}, ${comment})`;
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;
};

generator.forBlock['json'] = function(block) {
    var code;
    
    var value = escapeString(block.getFieldValue('Block') || []);
    code = `json_decode(${value})`;

    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }

    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;
};

generator.forBlock['call_function'] = function(block) {
    var params = ''
    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD' + i;
        params += generator.valueToCode(block, current, generator.ORDER_NONE) || 'null';
    }

    var functionId = block.functionId_?.trim()

    var code = `\\App\\Execution\\FunctionManager::callFunction(${escapeString(functionId)}, [${params}])`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['set_feature'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE)

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeature(${feature}, ${value})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['get_feature'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';


    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->getFeature(${feature})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['validate_feature'] = function(block) {
    
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeatureValidity(${feature}, true)`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['invalidate_feature'] = function(block) {

    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE)

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeatureValidity(${feature}, false, ${value})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
    
};

generator.forBlock['enable_feature'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var enabled = block.getFieldValue('enable') > 0 ? 'true' : 'false';

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeatureEnabled(${feature}, ${enabled})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['apply_dataset'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var data = generator.valueToCode(block, 'DATA', generator.ORDER_NONE)

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeatureDataset(${feature}, ${data})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['show_message'] = function(block) {
    var message = escapeString(block.getFieldValue('Message')?.trim());

    var code = `\\App\\Configuration\\Configurator::sendShowMessageCommand(${message})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['dataset_data'] = function(block) {
    var params = ''
    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD' + i;
        params += generator.valueToCode(block, current, generator.ORDER_NONE) || 'null';
    }

    var code = `[${params}]`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['dataset'] = function(block) {
    var params = ''
    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD' + i;
        params += generator.valueToCode(block, current, generator.ORDER_NONE) || 'null';
    }

    var code = `array_merge(${params})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};


generator.forBlock['global_user_id'] = function(block) {
    var code = `\\App\\Configuration\\Context::getCurrentUser()`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['global_user_company'] = function(block) {
    var code = `((\\App\\Configuration\\Context::getCurrentUser())['IDcompany'] ?? null)`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['global_business_partner'] = function(block) {
    var code = `\\App\\Configuration\\Context::getCurrentBP()`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['get_index'] = function(block) {
    var variable = generator.valueToCode(block, 'block', generator.ORDER_NONE)
    var params = []
    for (var i = 0; i < this.itemCount_; i++) {
        var current = 'ADD_' + i;
        params.push(generator.valueToCode(block, current, generator.ORDER_NONE) || null);
    }
    
    var code = params
        .filter((e) => e !== 'null' && e !== null && e !== undefined)
        .reduce((accum, value) => {
            return `\\App\\Utils\\Vars::getIndex(${accum}, ${value})`
        }, variable);

    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['set_feature_default'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';

    var value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE)

    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->setFeatureDefault(${feature}, ${value})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};


generator.forBlock['check_feature'] = function(block) {
    var feature = block.getFieldValue('option') > 0 ? 
        escapeString(block.options[0]) : '\\App\\Configuration\\Context::getCurrentFeature()';


    var code = `\\App\\Configuration\\Context::getCurrentConfiguration()->checkFeaturePresence(${feature})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['global_st_product'] = function(block) {
    var code = `\\App\\Configuration\\Context::getCurrentProduct()`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['new_line'] = function(block) {
    let code = `"\\n"`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
    
};

generator.forBlock['select_process'] = function(block) {
    var process = escapeString(block.options[0]);

    if(block?.outputConnection?.targetConnection) {
        return [process, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        process += ';';
    }
    
    return code;
};

generator.forBlock['add_item'] = function(block) {

    var item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE)
    var qty = generator.valueToCode(block, 'QTY', generator.ORDER_NONE)
    var process = generator.valueToCode(block, 'PROCESS', generator.ORDER_NONE)
    var option = block.getFieldValue('option') != null && block.getFieldValue('option').length && parseInt(block.getFieldValue('option')) ? 'code' : 'id';
    
    var code = `\\App\\BOM\\BOM::addItem(${item}, ${escapeString(option)}, ${qty}, ${process})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
    
};

generator.forBlock['math_round'] = function (block) {
    const math_number = generator.valueToCode(block, 'NUM', generator.ORDER_FUNCTION_CALL)
    const decimals = generator.valueToCode(block, 'decimals', generator.ORDER_NONE)
    const operand = block.getFieldValue('op')
    let code = ''
    if (operand !== 'toFixed') {
        let method = ''
        switch (operand) {
            case 'ROUND':
                method = 'round'
                break
            case 'ROUNDUP':
                method = 'ceil'
                break
            case 'ROUNDDOWN':
                method = 'floor'
                break
        }
        code = `${method}(${math_number})`
    } else {
        let method = 'round';
        code = `${method}(${math_number}, ${decimals})`
    }

    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;
}


generator.forBlock['switch'] = function (block) {
    let _switch = generator.valueToCode(block, 'SWITCH', generator.ORDER_NONE);
    const cases = [];
    for(let i = 0; i <= block.caseCount_; i++) {
        let _case = generator.valueToCode(block, 'CASE' + i, generator.ORDER_NONE);
        let _do = generator.statementToCode(block, 'DO' + i);
        cases.push(`case ${_case}:
            ${_do}
            break;
        `)
    }
    if(block.defaultCount_); {
        let _default = generator.statementToCode(block, 'DEFAULT');
        cases.push(`default:
            ${_default}
        `)
    }

    let code = `
        switch (${_switch}) {
            ${cases.join("\n")}
        }`;

    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }

    return code;

}

generator.forBlock['enable_current_op'] = function(block) {
    const qty = generator.valueToCode(block, 'QTY', generator.ORDER_NONE) || 0;
    const note = generator.valueToCode(block, 'NOTES', generator.ORDER_NONE) || null;
    
    var code = `\\App\\Routing\\Routing::enableProcess(\\App\\Configuration\\Context::getCurrentProcess()['id'], ${qty}, ${note})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};


generator.forBlock['apply_price'] = function(block) {
    var item = generator.valueToCode(block, 'ITEM', generator.ORDER_NONE)
    var qty = generator.valueToCode(block, 'QTY', generator.ORDER_NONE)
    var option = block.getFieldValue('option') != null && block.getFieldValue('option').length && parseInt(block.getFieldValue('option')) ? 'code' : 'id';

    var width = block.has_width_ ? generator.valueToCode(block, 'WIDTH', generator.ORDER_NONE) : null;
    var minPrice = block.has_min_price_ ? generator.valueToCode(block, 'MIN_PRICE', generator.ORDER_NONE) : null;
    var notes = block.has_notes_ ? generator.valueToCode(block, 'NOTES', generator.ORDER_NONE) : null;
    
    var code = `\\App\\Pricing\\Pricelist::addComponent(${item}, ${escapeString(option)}, ${qty}, ${width}, ${minPrice}, ${notes})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};


generator.forBlock['global_current_date'] = function(block) {
    var code = `date('Y-m-d H:i:s')`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

generator.forBlock['date_format'] = function(block) {
    var date = generator.valueToCode(block, 'DATE', generator.ORDER_NONE)
    var format = escapeString(block.getFieldValue('Format') || 'Y-m-d');

    var code = `(new \\DateTimeImmutable(${date}))->format(${format})`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};


generator.forBlock['text_length'] = function(block) {
    var value = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE)
    const functionName = generator.provideFunction_(
        'length',
        `
            function ${generator.FUNCTION_NAME_PLACEHOLDER_}($value) {
            if (is_string($value) || is_numeric($value)) {
                return strlen((string)$value);
            }
            if($value === null || $value === false) {
                return 0;
            }
            return count($value);
            }
        `,
      );
      const text = generator.valueToCode(block, 'VALUE', generator.ORDER_NONE) || "''";
      return [functionName + '(' + text + ')', generator.ORDER_FUNCTION_CALL];
};


generator.forBlock['global_current_row_qty'] = function(block) {
    var code = `\\App\\Configuration\\Context::getCurrentQuantity()`;
    if(block?.outputConnection?.targetConnection) {
        return [code, generator.ORDER_NONE]
    }
    if(!block?.outputConnection || (block?.nextConnection?.targetConnection || block?.previousConnection?.targetConnection)) {
        code += ';';
    }
    
    return code;
};

class customNames extends Blockly.Names {

    getDistinctName(desired, type) {
        let _desired = super.getDistinctName(desired, type);
        if(type == 'PROCEDURE') {
            return _desired + '_' + crypto.randomUUID().replaceAll('-', '_');
        }

        return _desired;
    }
}

generator.nameDB_ = new customNames(generator.RESERVED_WORDS_, '$');

generator.provideFunction_ = function (desiredName, code) {
    if (!this.definitions_[desiredName]) {
      const functionName = this.nameDB_.getDistinctName(
        desiredName,
        'PROCEDURE',
      );
      this.functionNames_[desiredName] = functionName;
      if (Array.isArray(code)) {
        code = code.join('\n');
      }
      let codeText = code
        .trim()
        .replace(this.FUNCTION_NAME_PLACEHOLDER_REGEXP_, functionName);
      
      let oldCodeText;
      while (oldCodeText !== codeText) {
        oldCodeText = codeText;
        codeText = codeText.replace(/^(( {2})*) {2}/gm, '$1\0');
      }
      codeText = codeText.replace(/\0/g, this.INDENT);

      codeText = `if(!function_exists("${functionName}")) {
        ${codeText}
      }`;
      this.definitions_[desiredName] = codeText;
    }
    return this.functionNames_[desiredName];
}

export default generator;