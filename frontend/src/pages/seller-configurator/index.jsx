import {  Select } from "antd";
import React, { useEffect, useState } from "react";
import SellConfigurator from "./configurator";
import { getAllStandardProducts } from "@/api/configurator/seller-configurator";

const StandardProduct = () => {
  const [baseProduct, setBaseProduct] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    const doCall = async () => {
      const response = await getAllStandardProducts() ;
      setBaseProduct(response.data.data);
    };
    doCall();
  }, []);


  
  return (
    <>
      {!selectedProduct ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <h4>Select a standard product</h4>
          <Select
            style={{ width: 400 }}
            onChange={(e) =>  {
              setSelectedProduct(e) 
            }
            }
          >
            {baseProduct?.map((item) => (
              <Select.Option key={item.id} value={item.code}>
                {item.name}
              </Select.Option>
            ))}
          </Select>
              <span>{selectedProduct}</span>
          <div
            style={{
              display: "flex",
              width: "400px",
              justifyContent: "flex-end",
            }}
          >

          </div>
        </div>
      ) : (
        <SellConfigurator productSelected={selectedProduct} />
      )}
    </>
  );
};

export default StandardProduct;
