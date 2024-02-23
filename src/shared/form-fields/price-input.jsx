import React, { useEffect, useState, useRef } from "react";
import { InputNumber, Select, Space, Typography } from "antd";
const { Text } = Typography;
import { getAllCurrencies } from "@/api/bp";
import _ from "lodash";
import { getSession } from "@/lib/api";

const PriceInput = ({
	value,
	name,
	index,
	currency,
	disabled,
	currencyOptions,
	onChange, // utilizzare onChange associato al blur o all enter perche se utilizzato in Form.Item è sempre presente e si scatenerebbe ad ogni pressione di tasto
	onBlur, // utilizzare blur e enter quando nn si vuole aggiornare il valore esterno prima del tempo
	onEnter,
	emitValueOnChange = true, // utilizzare emitValueOnChange per cambiare il campo direttamente
	showSymbolSelection,
	status,
	...props
}) => {
	const user = getSession();
	const decimalSeparator = user?.decimal_symb;
	const [symbol, setSymbol] = useState("-");
	const [inputValue, setInputValue] = useState(null);
	const inputNumber = useRef(null);

	/**
	 * verificare che value che arriva dall esterno nn sia negativa oppure apportare le giuste modifiche
	 *  in mopdo che il simbolo rimanga solo nella select se attiva la proprietà
	 * altrimenti utilizzare il valore con segno
	 */
	useEffect(() => {
		if (value || value === 0) {
			let newVal = getMaxValue(value);
			setSymbol(String(newVal).startsWith("-") ? "-" : "+");
			setInputValue(showSymbolSelection ? String(newVal).replace("-", "") : newVal);
		}
	}, [value]);

	const createSignedValue = (val) => {
		if (val === "" || val === null) {
			return null;
		}
		val = getMaxValue(parseFloat(String(val).replace("-", "")));

		return parseFloat(
			!_.isNil(val) && showSymbolSelection && symbol === "-" ? `${symbol}${val}` : val
		);
	};
	const getMaxValue = (value) => {
		//console.log(value);
		if (showSymbolSelection && symbol === "-" && value >= 100) {
			return 100;
		}
		return value;
	};
	const handleSymbolChange = (value) => {
		setSymbol(value);
	};

	/**
	 * la funzione setta prima di tutto il valore del value locale poi se richiesto inviare all esterno i valori
	 * @param {*} value
	 */
	const handleChange = (value) => {
		setInputValue(getMaxValue(value));

		const newVal = createSignedValue(value);

		if (emitValueOnChange) {
			onChange(newVal);
		}
	};
	/**
	 * invia i valori all esterno al blur
	 * @param {*} value
	 */
	const handleBlur = (value) => {
		const newVal = createSignedValue(value);
		if (onBlur && _.isFunction(onBlur)) {
			onBlur(newVal);
		} else {
			onChange(newVal);
		}
	};

	/**
	 * invia i valori all esterno al enter
	 * @param {*} value
	 */
	const handleEnter = (value) => {
		inputNumber.current.blur();
		inputNumber.current.focus();
		// const newVal = createSignedValue(value);
		// console.log(newVal);
		// if (onEnter && _.isFunction(onEnter)) {
		// 	onEnter(newVal);
		// } else if (emitValueOnChange) {
		// 	onChange(newVal);
		// }
	};

	const [currencyOpts, setCurrencyOpts] = useState([]);

	useEffect(() => {
		// check if options come from the parent, otherwise make an API call and set local state
		if (!currencyOptions) {
			(async () => {
				const { data, error } = await getAllCurrencies();
				if (!error) {
					setCurrencyOpts(
						_.map(data, (o) => {
							return {
								label: o.symbol,
								value: o.id,
							};
						})
					);
				}
			})();
		} else {
			setCurrencyOpts(
				_.map(currencyOptions, (o) => {
					return {
						label: o.symbol,
						value: o.id,
					};
				})
			);
		}
	}, []);

	return (
		<>
			<Space.Compact
				style={{ width: "100%" }}
				key={index}
			>
				{showSymbolSelection && (
					<Select
						disabled={disabled}
						style={{ maxWidth: "60px", minWidth: "60px", textAlign: "center" }}
						value={symbol}
						onChange={handleSymbolChange}
						onBlur={() => {
							handleBlur(inputValue);
						}}
						options={[
							{ value: "-", label: "-" },
							{ value: "+", label: "+" },
						]}
					/>
				)}
				<InputNumber
					decimalSeparator={decimalSeparator}
					name={name}
					ref={inputNumber}
					disabled={disabled}
					value={inputValue}
					allowClear
					controls={false}
					precision={2}
					// min={0} // potrebbe servire andare a -
					max={showSymbolSelection && symbol === "-" ? 100 : null}
					onChange={(value) => handleChange(value)}
					onBlur={({ target }) => handleBlur(target.value)}
					onKeyDown={(event) => {
						if (event.code === "Enter" || event.code === "NumpadEnter") {
							event.preventDefault();
							event.stopPropagation();
							handleEnter(event.target.value);
						}
					}}
					addonAfter={_.find(currencyOpts, (o) => o.value === currency)?.label}
					// help
					status={status}
				/>
			</Space.Compact>
		</>
	);
};

export default PriceInput;
