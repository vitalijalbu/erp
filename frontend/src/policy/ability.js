import {
	PureAbility,
	AbilityBuilder,
	AbilityTuple,
	MatchConditions,
} from "@casl/ability";
import { useRouter } from "next/router";
import { Can as BaseCan } from "@casl/react";
import userPolicy from "./userPolicy";
import bpPolicy from "./bpPolicy";
import warehousePolicy from "./warehousePolicy";
import itemsPolicy from "./itemsPolicy";
import ordersPolicy from "./ordersPolicy";
import inventoryPolicy from "./inventoryPolicy";
import reportPolicy from "./reportPolicy";
import materialsPolicy from "./materialsPolicy";
import machinesPolicy from "./machinesPolicy";
import wacPolicy from "./wacPolicy";
import configuratorPolicy from "./configuratorPolicy";
import saleSequencesPolicy from "./saleSequencesPolicy";
import salesPolicy from "./salesPolicy";
import salePricelistPolicy from "./salePricelistPolicy.js";
import salesOverrideDiscountPolicy from "./salesOverrideDiscountPolicy.js";
const lambdaMatcher = (matchConditions) => matchConditions;

const UserPermissions = {
	ability: null,
	defineAbilityFor: function (user) {
		const { can, build } = new AbilityBuilder(PureAbility);

		userPolicy({ can, user });
		bpPolicy({ can, user });
		warehousePolicy({ can, user });
		itemsPolicy({ can, user });
		ordersPolicy({ can, user });
		inventoryPolicy({ can, user });
		reportPolicy({ can, user });
		materialsPolicy({ can, user });
		wacPolicy({ can, user });
		configuratorPolicy({ can, user });
		saleSequencesPolicy({ can, user });
		salesPolicy({ can, user });
		salePricelistPolicy({ can, user });
		machinesPolicy({ can, user });
		salesOverrideDiscountPolicy({ can, user });
		this.ability = build({ conditionsMatcher: lambdaMatcher });
	},
	clearAbility: function () {
		//console.log('ability cleared');
		const { can, build } = new AbilityBuilder(PureAbility);
		this.ability = build({ conditionsMatcher: lambdaMatcher });
	},
	check(check, conditions = {}) {
		const toCheck = {};
		if (typeof check == "string") {
			toCheck[check] = conditions;
		} else if (Array.isArray(check)) {
			for (let c of check) {
				toCheck[c] = conditions;
			}
		}
		const keys = Object.keys(toCheck);
		const checked = keys.map((c) => this.ability.can(c, toCheck[c]));

		return checked;
	},
	can(check, conditions = {}) {
		const checked = this.check(check, conditions);
		return checked.filter((c) => c == false).length == 0;
	},
	canAny(check, conditions = {}) {
		const checked = this.check(check, conditions);
		return checked.filter((c) => c == true).length > 0;
	},
	authorizePage: function (check, conditions = {}, redirect = "/") {
		const can = this.can(check, conditions);
		if (!can) {
			const router = useRouter();
			router.push(redirect);
		}

		return can;
	},
	ifCan: function (check, conditions, retYes, retNo) {
		const can = this.can(check, conditions);
		return can ? retYes : retNo;
	},
	ifCanAny: function (check, conditions, retYes, retNo) {
		const can = this.canAny(check, conditions);
		return can ? retYes : retNo;
	},
	isAdmin: function (user) {
		return user.roles.filter((role) => role.name == "admin").length > 0;
	},
};

UserPermissions.clearAbility();

const abilityProxy = new Proxy(UserPermissions, {
	get(target, prop, receiver) {
		return target.ability[prop];
	},
	set(target, prop, value) {
		target.ability[prop] = value;
		return true;
	},
});

export const Can = (props) => (
	<BaseCan {...{ ...{ on: {} }, ...props, ability: abilityProxy }}>
		{props.children}
	</BaseCan>
);
export default UserPermissions;
