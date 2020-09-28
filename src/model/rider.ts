import { EventEmitter } from "@hediet/std/events";
import { VisualizationId, VisualizationData } from "@hediet/visualization-core";

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

type OutgoingMessage =
	| {
			kind: "getAvailableVisualizationsResponse";
			requestId: string;
			availableVisualizations: VisualizationInfo[];
	  }
	| { kind: "response"; requestId: string }
	| { kind: "initialized" };

interface VisualizationInfo {
	id: VisualizationId;
	name: string;
	priority: number;
	visualizationHandle: string;
}

type IncomingMessage =
	| {
			kind: "getAvailableVisualizations";
			data: VisualizationData;
			requestId: string;
	  }
	| {
			kind: "showVisualization";
			visualizationHandle: string;
			requestId: string;
	  }
	| {
			kind: "showText";
			text: string;
			requestId: string;
	  }
	| {
			kind: "setTheme";
			theme: "light" | "dark";
			requestId: string;
	  };
