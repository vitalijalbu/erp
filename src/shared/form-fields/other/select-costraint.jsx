import React, { useState } from "react";
import _ from 'lodash';
import SelectWithModal from "@/shared/components/select-with-modal";
import { getAllConstraints } from "@/api/configurator/constraints";
import SelectConstraintModal from "@/shared/configurator/configuration/select-constraint-modal";

const SelectConstraint = ({ name, value, onChange, reload, constraintType, placeHolder }) => {

  const [popup, setPopup] = useState(false);

  const togglePopup = () => {
    setPopup(!popup);
  };

  const filters = {
    columns: {
      'subtype': {
        search: { value: constraintType }
      },
      'is_draft': {
        search: { value: "0" }
      }
    }
  }

  const constraintCall = getAllConstraints

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
          <SelectConstraintModal
            data={{ subtype: constraintType, [constraintType + '_constraint_id']: value }}
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


export default SelectConstraint;
