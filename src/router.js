import React from "react";

import Home from "./components/Home.js";
import SeatMapScreen from "./components/SeatMapScreen"
import EditSeatMap from "./components/EditSeatMap"
import NewSeatMap from "./components/NewSeatMap"
import NewEvent from "./components/NewEvent"
import RSVPeventScreen from "./components/RSVPeventScreen"
import ListEvents from "./components/ListEvents"
import DashboardScreen from "./components/DashboardScreen"

const routes = {
  "/": () => (<Home />),
  "/seatmap": () => (<SeatMapScreen />),
  "/seatmap/edit/:key": ({key}) => (<EditSeatMap chartKey={key} />),
  "/seatmap/new": () => (<NewSeatMap />),
  "/events": () => (<ListEvents />),
  "/event/rsvp/:key": ({key}) => (<RSVPeventScreen eventKey={key}/>),
  "/event/new": () => (<NewEvent />),
  "/dashboard": () => (<DashboardScreen />),
};
export default routes;