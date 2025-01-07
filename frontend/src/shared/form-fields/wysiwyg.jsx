// import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
// import { CKEditor } from "@ckeditor/ckeditor5-react";
// import { Markdown } from '@ckeditor/ckeditor5-markdown-gfm';
import { CKEditor } from "@ckeditor/ckeditor5-react";
import Editor from "ckeditor5-custom-build/build/ckeditor";
import { random } from "lodash";
import React from "react";

const Wysiwyg = ({ data, onChange, onBlur, onFocus, toolbar, plugins }) => {
	// const default
	// const configuration = {
	// 	toolbar: toolbar,
	// 	plugins: plugins
	// }
	return (
		<CKEditor
			editor={Editor}
			data={data}
			// onReady={(editor) => {
			// 	// editor.data = data
			// 	// editor.setData(data)
			// 	// You can store the "editor" and use when it is needed.
			// 	console.log("Editor is ready to use!", editor);
			// }}
			onChange={(event, editor) => {
				const data = editor.getData();
				onChange(data);
			}}
			disableWatchdog={true}
			key={Math.floor(Math.random() * 1000)}
			// onBlur={(event, editor) => {
			// 	const data = editor.getData();
			// 	onBlur(data);;
			// }}
			// onFocus={(event, editor) => {
			// 	const data = editor.getData();
			// 	onFocus(data);
			// }}
		/>
	);
};
export default Wysiwyg;
