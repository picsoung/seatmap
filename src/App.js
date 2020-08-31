import "./App.css";
import mondaySdk from "monday-sdk-js";

import {useRoutes, navigate} from 'hookrouter';
import Routes from './router'

const monday = mondaySdk();

function App () {
  const routeResult = useRoutes(Routes)
  return routeResult
}

export default App;
