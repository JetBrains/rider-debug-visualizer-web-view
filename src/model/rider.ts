import { EventEmitter } from "@hediet/std/events";
import { ExtractedData } from "../../../vscode-debug-visualizer/node_modules/@hediet/debug-visualizer-data-extraction/dist";
import { VisualizationId } from "@hediet/visualization-core";

export class Rider {
	private readonly onMessageEmitter = new EventEmitter<{
		message: IncomingMessage;
	}>();
	public readonly onMessage = this.onMessageEmitter.asEvent();

	private get extendedWindow(): ExtendedWindow {
		return (window as unknown) as ExtendedWindow;
	}

	private sendMessageToRider: (message: string) => void;

	constructor() {
		this.extendedWindow.processEvent = (event) => {
			const message = JSON.parse(event);
			this.onMessageEmitter.emit({ message });
		};

		let queue: string[] = [];

		if (this.extendedWindow.sendMessageToRider) {
			this.sendMessageToRider = this.extendedWindow.sendMessageToRider;
		} else {
			this.sendMessageToRider = (message: string) => {
				queue.push(message);
			};

			Object.defineProperty(this.extendedWindow, "sendMessageToRider", {
				get: () => this.sendMessageToRider,
				set: (value) => {
					this.sendMessageToRider = value;
					for (const item of queue) {
						this.sendMessageToRider(item);
					}
					queue.length = 0;
				},
			});
		}
	}

	public sendMessage(message: OutgoingMessage): void {
		this.sendMessageToRider(JSON.stringify(message));
	}
}

interface ExtendedWindow {
	processEvent: ((event: string) => void) | undefined;
	sendMessageToRider: ((message: string) => void) | undefined;
}

type OutgoingMessage = { kind: "initialized" } | VisualizationResult;

export interface VisualizationResult {
	kind: "visualizationResult";
	usedVisualizationId: VisualizationId | undefined;
	availableVisualizations: VisualizationInfo[];
}

interface VisualizationInfo {
	id: VisualizationId;
	name: string;
	priority: number;
}

type IncomingMessage = {
	kind: "updateState";
	state: VisualizationState;
};

type VisualizationData = ExtractedData;

export type VisualizationState =
	| {
			kind: "visualization";
			data: VisualizationData;
			preferredVisualizationId?: VisualizationId;
	  }
	| {
			kind: "text";
			text: string;
	  };
