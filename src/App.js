import React from "react";
import "./App.css";
import mondaySdk from "monday-sdk-js";

import {useRoutes, navigate} from 'hookrouter';
import Routes from './router'

import { Box, Button as GrommetButton, Grommet } from 'grommet';
const monday = mondaySdk();

function App () {
  const routeResult = useRoutes(Routes)
  return routeResult
}

// class App extends React.Component {
//   constructor(props) {
//     super(props);

//     // Default state
//     this.state = {
//       settings: {},
//       name: "",
//     };
//   }

//   componentDidMount() {
//     // TODO: set up event listeners
//   }

//   render() {
    
//     return (
//       <Box>
//          <div className="App">Hello, ahahah Apps!</div>
//          <GrommetButton color="primary" label='Login' />
//       </Box>
//     );
//   }
// }

export default App;
