import { observable, computed, autorun } from "mobx";
import { Rider, VisualizationState, VisualizationResult } from "./rider";
import {
	Visualization,
	globalVisualizationFactory,
	Visualizations,
	VisualizationId,
} from "@hediet/visualization-core";
import "@hediet/visualization-bundle";

export class Model {
	@observable log = new Array<string>();

	private readonly api = new Rider();

	@observable.ref state: VisualizationState | undefined;

	private lastVisualizations: Visualizations = {
		bestVisualization: undefined,
		allVisualizations: [],
		visualizationDataErrors: [],
	};

	@computed get stateWithVisualizations(): {
		bestVisualization: Visualization | undefined;
		allVisualizations: Visualization[];
		overlay: { text: string } | undefined;
	} {
		if (!this.state) {
			return { ...this.lastVisualizations, overlay: { text: "loading" } };
		}

		switch (this.state.kind) {
			case "text": {
				return {
					...this.lastVisualizations,
					overlay: { text: this.state.text },
				};
			}
			case "visualization": {
				const vis = globalVisualizationFactory.getVisualizations(
					this.state.data,
					this.state.preferredVisualizationId
				);
				this.lastVisualizations = vis;
				return { ...vis, overlay: undefined };
			}
		}
	}

	@computed get allVisualizations(): Visualization[] {
		return this.stateWithVisualizations.allVisualizations;
	}

	@computed get usedVisualizationId(): VisualizationId | undefined {
		if (this.stateWithVisualizations.bestVisualization) {
			return this.stateWithVisualizations.bestVisualization.id;
		}
		return undefined;
	}

	constructor() {
		this.api.onMessage.sub(({ message }) => {
			if (message.kind === "updateState") {
				this.state = message.state;
			}
		});
		autorun(() => {
			this.api.sendMessage({
				kind: "visualizationResult",
				availableVisualizations: this.allVisualizations.map((v) => ({
					id: v.id,
					name: v.name,
					priority: v.priority,
				})),
				usedVisualizationId: this.usedVisualizationId,
			});
		});
		this.api.sendMessage({
			kind: "initialized",
		});
	}
}
