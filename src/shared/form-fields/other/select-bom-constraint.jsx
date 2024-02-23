import React, { useState } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { getAllConstraints } from "@/api/configurator/constraints";
import SelectBomConstraintModal from "@/shared/configurator/bom-constraints/select-bom-constraint-modal";

const SelectBomConstraint = ({ name, value, onChange, reload, placeHolder }) => {

  const [popup, setPopup] = useState(false);

  const constraintType = 'bom';

  const filters = {
    columns: {
      'constraint_type': {
        search: { value: constraintType }
      },
      'is_draft': {
        search: { value: "0" }
      }
    }
  }

  const constraintCall = getAllConstraints;

  const togglePopup = () => {
    setPopup(!popup);
  };

  const handleOnchange = (value) => {
    onChange(value)
  }

  const handleSelect = (value) => {
    onChange(value)
    togglePopup()
  }

  return (
    <>
      <SelectWithModal
        name={name}
        value={value}
        callBack={constraintCall}
        filter={filters}
        onChange={(value) => handleOnchange(value)}
        reload={reload}
        optionLabel={['id', 'label']}
        placeHolder={placeHolder}
        onTogglePopUp={togglePopup}
        extras={popup && (
          <SelectBomConstraintModal
            data={{ 'constraint_type': constraintType, ['constraint_id']: value }}
            onSelect={(value) => handleSelect(value)}
            opened={popup}
            reload={reload}
            toggle={togglePopup}
          />
        )}
      />
    </>
  )
}

export default SelectBomConstraint;
