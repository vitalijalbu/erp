import { getAllCurrencies } from "@/api/bp";
import { sessionFormattedPrice, sessionFormatter } from "@/hooks/formatter";
import { getSession } from "@/lib/api";
import { Typography } from "antd";
const { Text } = Typography;
import _ from "lodash";
import React, { useEffect, useState } from "react";

const PriceDisplay = ({ currencyId, currencyOptions, price, minDecimals, maxDecimals }) => {
	const user = getSession();
	const [currency, setCurrency] = useState(null);
	const [computedPrice, setComputedPrice] = useState(null);
	const [decimalCount, setDecimalCount] = useState(2);

	useEffect(() => {
		// check if options comes from parent otherwise make a api call and set local state
		let currentCurrency;
		if (!currencyOptions) {
			(async () => {
				const { data, error } = await getAllCurrencies();
				if (!error) {
					currentCurrency = _.find(data, (o) => o.id === currencyId);
					setCurrency(currentCurrency);
				}
			})();
		} else {
			currentCurrency = _.find(currencyOptions, (o) => o.id === currencyId);
			setCurrency(currentCurrency);
		}

		if (currentCurrency) {
			let rounding = currentCurrency.rounding;
			setDecimalCount(String(rounding).split(".")[1]?.length);
		}
	}, [currencyId, currencyOptions]);

	useEffect(() => {
		// console.log(user, currency);
		if (!!price || price === 0) {
			// set display variable
			setComputedPrice(sessionFormatter(price, currency, minDecimals, maxDecimals));
		}
	}, [price, user, decimalCount]);

	return <div className="text-right">{computedPrice && <Text>{computedPrice}</Text>}</div>;
};
export default PriceDisplay;
