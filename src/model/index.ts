import { computed, observable, runInAction } from "mobx";
import { Rider } from "./rider";
import {
	Visualization,
	globalVisualizationFactory,
	Theme,
} from "@hediet/visualization-core";
import "@hediet/visualization-bundle";

export type VisualizationState =
	| {
			kind: "loading";
	  }
	| {
			kind: "visualization";
			visualization: Visualization;
	  }
	| {
			kind: "text";
			text: string;
	  };

export class Model {
	private readonly api = new Rider();

	@observable.ref visualization: Visualization | undefined;
	@observable overlayText: string | undefined;

	@observable themeName: "light" | "dark" = "light";

	@computed get theme(): Theme {
		if (this.themeName === "light") {
			return Theme.light;
		} else {
			return Theme.dark;
		}
	}

	private cachedVisualizations = new Map<
		/* visualizationHandle */ string,
		Visualization
	>();

	private visualizationIdx = 0;

	constructor() {
		this.api.onMessage.sub(({ message }) => {
			runInAction(() => {
				if (message.kind === "showText") {
					this.overlayText = message.text;
				} else if (message.kind === "showVisualization") {
					const visualization = this.cachedVisualizations.get(
						message.visualizationHandle
					);
					this.overlayText = undefined;
					this.visualization = visualization;
					// TODO error handling
					this.api.sendMessage({
						kind: "response",
						requestId: message.requestId,
					});
				} else if (message.kind === "getAvailableVisualizations") {
					const visualizations = globalVisualizationFactory.getVisualizations(
						message.data,
						undefined
					).allVisualizations;
					this.cachedVisualizations = new Map(
						visualizations.map((v) => [
							`vis-${this.visualizationIdx++}`,
							v,
						])
					);
					this.api.sendMessage({
						kind: "getAvailableVisualizationsResponse",
						requestId: message.requestId,
						availableVisualizations: [
							...this.cachedVisualizations.entries(),
						].map(([visualizationHandle, vis]) => ({
							id: vis.id,
							name: vis.name,
							priority: vis.priority,
							visualizationHandle,
						})),
					});
				} else if (message.kind === "setTheme") {
					this.themeName = message.theme;
					this.api.sendMessage({
						kind: "response",
						requestId: message.requestId,
					});
				}
			});
		});

		this.api.sendMessage({
			kind: "initialized",
		});
	}
}
