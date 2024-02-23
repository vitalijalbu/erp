import React, { useState, useEffect } from "react";
import { Form, InputNumber } from "antd";
import { getUMById } from "@/api/globals/index";



const DynamicDimensions = ({ data, um, onChange, readonly, validationErrors }) => {
  const [form] = Form.useForm();
  const [inputs, setInputs] = useState([]);

  const validationErrorsBag = validationErrors;

  useEffect(() => {
    if(um){
      getUMById(um)
        .then(({ data }) => {
          setInputs(data || []);
        })
        .catch((err) => {
          console.log(err)
        });
      }else{
        //console.log('empty um', um)
      }
  }, [um]);



  return (
    <>
     {inputs.map((input) => (

          <Form.Item 
            label={input.umdesc} 
            name={input.IDcar.toLowerCase()} 
            disabled={readonly ?? false}
            {...validationErrorsBag.getInputErrors(input.IDcar.toLowerCase())}
          >
            <InputNumber 
              min={input.IDcar.toLowerCase() == 'pz' && um.toLowerCase() == 'n' ? 1 : 0.1} 
              step={input.IDcar.toLowerCase() == 'pz' && um.toLowerCase() == 'n' ? 1 : 0.01} 
              readOnly={readonly ?? false}
            />
          </Form.Item>
      ))}
    </>
  );
};

export default DynamicDimensions;
