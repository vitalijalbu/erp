import UserPermissions from "./ability";

export default function ({ can, user }) {
	can("sales_override_discount.manage", "all", () => {
		if (UserPermissions.isAdmin(user)) {
			return true;
		}
		return user.is_authorized.includes("sales_override_discount.manage");
	});
}
