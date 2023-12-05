import { Editor, HistoryEntry, SerializedStore, TLEventInfo, TLRecord, TLShape, TLUiEventHandler, TLUiOverrides, Tldraw, UiEvent, toolbarItem } from "@tldraw/tldraw";
import * as React from "react";
import { useCallback, useRef, PointerEventHandler, useEffect } from "react";
import { initCamera, preventTldrawCanvasesCausingObsidianGestures } from "src/utils/helpers";
import HandwritingContainer from "./shapes/handwriting-container"
import { debounce } from "obsidian";

///////
///////

const MyCustomShapes = [HandwritingContainer];

const myOverrides: TLUiOverrides = {
	toolbar(editor: Editor, toolbar, { tools }) {
		const reducedToolbar = [
			toolbar[0],
			toolbar[2],
			toolbar[3]
		];
		return reducedToolbar;
	},
	// actionsMenu(editor: Editor, actionsMenu, {actions}) {
	// 	console.log('actionsMenu', actionsMenu);
	// 	// const reducedToolbar = [
	// 	// 	toolbar[0],
	// 	// 	toolbar[2],
	// 	// 	toolbar[3]
	// 	// ]
	// 	return actionsMenu;
	// }
}


export function TldrawViewEditor (props: {
	existingData: SerializedStore<TLRecord>,
	uid: string,
	save: Function,
}) {
	// const assetUrls = getAssetUrlsByMetaUrl();
	const containerRef = useRef<HTMLDivElement>(null)
	const [outputLog, setOutputLog] = React.useState('This is the output log');

	const handleMount = (editor: Editor) => {

		// const allRecords = editor.store.allRecords();
		// const containers = allRecords.filter( (record: any) => {
		// 	return record?.type === 'handwriting-container'
		// })
		// if(!containers.length) {
		// 	editor.createShapes([{ type: 'handwriting-container' }]);
		// }

		initCamera(editor);
		editor.updateInstanceState({
			isDebugMode: false,
		})

		editor.store.listen((entry) => {
			if(!containsCompleteContentChanges(entry)) return;
			console.log('update');
			console.log('entry', JSON.parse(JSON.stringify(entry)));

			const contents = editor.store.getSnapshot();
			props.save(contents);
			writingPostProcess(entry, editor);			
		})

		preventTldrawCanvasesCausingObsidianGestures();
		editor.setCurrentTool('draw')
	}

	return <>
		<div
			ref = {containerRef}
			style = {{
				height: '100%',
			}}
		>
			<Tldraw
				// TODO: Try converting snapshot into store: https://tldraw.dev/docs/persistence#The-store-prop
				snapshot = {props.existingData}	// NOTE: Check what's causing this snapshot error??
				// persistenceKey = {props.uid}
				onMount = {handleMount}
				// assetUrls = {assetUrls}
				shapeUtils = {MyCustomShapes}
				overrides = {myOverrides}
			/>
			{/* <div
				className = 'output-log'
				style = {{
					position: 'absolute',
					bottom: '60px',
					left: '50%',
					transform: 'translate(-50%, 0)',
					zIndex: 10000,
					backgroundColor: '#000',
					padding: '0.5em 1em'
				}}
				>
				<p>Output Log:</p>
				{outputLog}
			</div> */}
		</div>
	</>;
	
};

export default TldrawViewEditor;





// Use this to run optimisations after a short delay
const writingPostProcess = debounce( (entry: HistoryEntry<TLRecord>, editor: Editor) => {
	
	const addedIds = Object.keys(entry.changes.added);
	if(addedIds.length) {
		const anId = addedIds[0];

		const allShapes = editor.currentPageShapes;
		allShapes.forEach( (record: TLShape) => {
			if(record.id == anId) return;
			if(record.type != 'draw') return;
			editor.updateShape({
				id: record.id,
				type: record.type,
				opacity: 0,
			})
		})
	}
	


}, 2000, true)

function containsCompleteContentChanges(entry: HistoryEntry<TLRecord>): boolean {
	if(Object.keys(entry.changes.added).length) {
		return true;
	}
	if(Object.keys(entry.changes.removed).length) {
		return true;
	}
	return false;
}