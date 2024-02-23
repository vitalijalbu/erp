export const destroyBlocklyOrphans = async () => {
	let orphans = [];
	orphans.push(document.getElementsByClassName('blocklyWidgetDiv')[0])
	orphans.push(document.getElementsByClassName('blocklyDropDownDiv')[0])
	orphans.push(document.getElementsByClassName('blocklyTooltipDiv')[0])
	orphans.push(document.getElementsByClassName('blocklyComputeCanvas')[0])

	orphans.forEach(el => {
		if(el){
			el.style.display = 'none';
		};
	})
}