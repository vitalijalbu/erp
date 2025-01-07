export const dataFeatures = async () => {
	if (typeof window !== "undefined") {
		const { getAllFeatures } = await import("@/api/configurator/features");
		const response = await getAllFeatures();
		if (response.error) {
			alert(response.error.message);
		} else {
			return response.data.data.map((el) => [el.id, `${el.id} - ${el.label}`]);
		}
	}
	return [];
};
export const dataProcess = async (filter) => {
	if (typeof window !== "undefined") {
		const { getAllProcesses } = await import("@/api/processes/processes");
		const response = await getAllProcesses(filter);
		if (response.error) {
			alert(response.error.message);
		} else {
			console.log(response.data)
			return response.data.data.map((el) => [el.id, `${el.id} - ${el.name}`]);
		}
	}
	return [];
};
export const dataMachines = async (filter) => {
	if (typeof window !== "undefined") {
		const { getAllProcesses } = await import("@/api/processes/processes");
		const response = await getAllProcesses(filter);
		if (response.error) {
			alert(response.error.message);
		} else {
			console.log(response.data)
			return response.data.data.map((el) => [el.id, `${el.id} - ${el.name}`]);
		}
	}
	return [];
};
export const dataOperators = async (filter) => {
	if (typeof window !== "undefined") {
		const { getAllProcesses } = await import("@/api/processes/processes");
		const response = await getAllProcesses(filter);
		if (response.error) {
			alert(response.error.message);
		} else {
			console.log(response.data)
			return response.data.data.map((el) => [el.id, `${el.id} - ${el.name}`]);
		}
	}
	return [];
};