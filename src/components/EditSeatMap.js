import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Grid, Box, Heading, Button, Grommet, Text, Image } from "grommet";
import { Home, Cluster, Add, Edit, View } from "grommet-icons";

import Spinner from "./Spinner";
import {
  SeatsioSeatingChart,
  SeatsioChartManager,
  SeatsioDesigner,
} from "@seatsio/seatsio-react";
import { SeatsioClient } from "seatsio";

const monday = mondaySdk();

const EditSeatMap = ({ chartKey }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [currentChart, setCurrentChart] = useState({});

  useEffect(() => {
    monday.listen("settings", async (res) => {
      console.log("seeeet", res.data);
      setSettings(res.data);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let chrt = await client.charts.retrieve(chartKey);
        console.log(chrt);
        setCurrentChart(chrt);
        setLoading(false);
      }
    });
  }, []);

  return (
    <Box fill={true}>
      <Grid
        rows={["xxsmall", "xsmall", "full"]}
        columns={["3/4", "1/4"]}
        areas={[
          { name: "nav", start: [0, 0], end: [1, 0] },
          { name: "header", start: [0, 1], end: [1, 1] },
          { name: "main", start: [0, 2], end: [1, 2] },
        ]}
        fill={true}
      >
        <Box
          gridArea="nav"
          direction="row"
          align="center"
          background="light-2"
          pad="medium"
        >
          <A href="/"><Home/></A>
          <A href="/seatmap">Back</A>
        </Box>
        <Box gridArea="header" background="brand" pad="medium">
          {loading && <Spinner />}
          <Heading color="white" margin="none">
            {currentChart.name}
          </Heading>
        </Box>
        <Box gridArea="main" background="light-2" fill={true} id="booxxxx">
          {!loading && settings && currentChart && (
            <SeatsioDesigner
              designerKey={settings.seatsio_secret_key}
              chartKey={chartKey}
              id="booxxxx"
            />
          )}
        </Box>
      </Grid>
    </Box>
  );
};
export default EditSeatMap;
