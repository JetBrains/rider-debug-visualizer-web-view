import * as React from "react";
import { Model } from "../model";
import classnames = require("classnames");
import { observer } from "mobx-react";
import { hotComponent } from "../utils/hotComponent";
import { CenteredContent } from "./NoData";
import { VisualizationView, Theme } from "@hediet/visualization-core";

@hotComponent(module)
@observer
export class MainView extends React.Component<{ model: Model }, {}> {
	render() {
		const model = this.props.model;
		const vis = model.stateWithVisualizations.bestVisualization;
		const overlay = model.stateWithVisualizations.overlay;

		return (
			<div className="component-MainView" style={{}}>
				<div
					style={{
						width: "100%",
						height: "100%",
						position: "relative",
						// monaco's tooltips may overflow, so we clip them.
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: "100%",
							height: "100%",
						}}
					>
						{vis && (
							<VisualizationView
								visualization={vis}
								theme={Theme.dark}
							/>
						)}
					</div>
					{/* It is important to not unmount the visualization when showing a timeout error message */}
					{overlay && (
						<div
							style={{
								position: "absolute",
								zIndex: 1000,
								top: 0,
								left: 0,
								right: 0,
								bottom: 0,
								backgroundColor: "white",
							}}
						>
							<CenteredContent>
								<div
									style={{
										background: "white",
										padding: 10,
									}}
								>
									{overlay.text}
								</div>
							</CenteredContent>
						</div>
					)}
				</div>
			</div>
		);
	}
}
