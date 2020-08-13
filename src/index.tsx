import * as React from "react";
import * as ReactDOM from "react-dom";
import "./style.scss";
import { App } from "./components/App";
import "monaco-editor";

const elem = document.createElement("div");
elem.className = "root";
document.body.append(elem);
ReactDOM.render(<App />, elem);
