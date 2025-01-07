import React, { useState, useEffect } from "react";
import UserPermissions from "@/policy/ability";
import CountriesTable from "@/shared/geo-db/components-table/table-countries";
import TableProvinces from "@/shared/geo-db/components-table/table-provinces";
import TableCities from "@/shared/geo-db/components-table/table-cities";
import TableZipCodes from "@/shared/geo-db/components-table/table-zip-codes";
import { Tabs } from "antd";


const Index = () => {
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("nations");
	const [selectedNation, setSelectedNation] = useState({});
	const [selectedProvince, setSelectedProvince] = useState({});
	const [selectedCity, setSelectedCity] = useState({});
	const [prevTab, setPrevTab] = useState(activeTab);

	if (!UserPermissions.authorizePage("bp.management")) {
		return false;
	}

	useEffect(() => {
		setPrevTab(activeTab);
	}, [activeTab]);

	useEffect(() => {
		if (prevTab === "provinces" && activeTab === "nations") {
			setSelectedNation({ nation: { value: null } });
		} else if (prevTab === "cities" && activeTab === "provinces") {
			setSelectedProvince({});
		} else if (prevTab === "zip-codes" && activeTab === "cities") {
			setSelectedCity({});
		}
	}, [activeTab]);

	const handleNationSelect = (nation) => {
		setSelectedNation(nation);
		setActiveTab("provinces");
	};

	const handleProvinceSelect = (province) => {
		setSelectedProvince(province);
		setActiveTab("cities");
	};

	const handleCitySelect = (city) => {
		setSelectedCity(city);
		setActiveTab("zip-codes");
	};

	const items = [
		{
			label: "Nations",
			key: "nations",
			children: (
				<CountriesTable
					showArrow={true}
					onSelect={handleNationSelect}
				/>
			),
		},
		{
			label: "Provinces",
			key: "provinces",
			children: (
				<TableProvinces
					nation={{ ...selectedNation }}
					showArrow={true}
					onSelect={handleProvinceSelect}
				/>
			),
		},
		{
			label: "Cities",
			key: "cities",
			children: (
				<TableCities
					nation={selectedNation}
					province={selectedProvince}
					showArrow={true}
					onSelect={handleCitySelect}
				/>
			),
		},
		{
			label: "Zip Codes",
			key: "zip-codes",
			children: (
				<TableZipCodes
					city={selectedCity}
					showArrow={false}
					isModal={false}
				/>
			),
		}
	];

	return (
		<div className="page">
			<Tabs
				tabPosition="top"
				activeKey={activeTab}
				onChange={setActiveTab}
				items={items}
				className="fixed-tabs"	
				destroyInactiveTabPane={false}
			/>
		</div>
	);
};

export default Index;
