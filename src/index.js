import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

import { Grommet } from 'grommet';
import { grommet } from 'grommet/themes';

import * as serviceWorker from "./serviceWorker";

ReactDOM.render(<Grommet theme={grommet} full={true}><App /></Grommet>, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
