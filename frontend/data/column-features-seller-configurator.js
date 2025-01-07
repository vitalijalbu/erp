export const columnFeaturesSellerConfigurator = (RenderElement) => {
	return [
		/*  {
           title: 'ID',
           dataIndex: 'key',
           width: '10%',
           rowScope: 'row',
           editable: false,
           render: (text, record) => !record.hidden && <span>{text}</span> 
         }, */
		/*   { */
		/*  title: 'Code', */
		/*     dataIndex: 'code',
        width: '25%',
        editable: false,
        render: (text, record) => !record.hidden && <span>{text}</span>
      }, */
		{
			/*   title: 'Product Description', */
			dataIndex: "description",
			width: "20%",
			editable: false,
			render: (text, record) =>
				!record.hidden && (
					<div style={{ display: "flex", flexDirection: "column" }}>
						<b style={{ fontSize: 13 }}>{text}</b>
						{/* 	<span className='text-small'>{record.code}</span> */}
					</div>
				),
		},
		{
			/*  title: 'Selection', */
			dataIndex: "type",
			width: "55%",
			editable: false,
			render: (_text, record) =>
				!record.hidden && <RenderElement row={record} />,
		},
	];
};
