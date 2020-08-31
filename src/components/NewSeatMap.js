import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Grid, Box, Heading, Button, Grommet, TextInput, Image } from "grommet";
import { Cluster, Add, Edit, View } from "grommet-icons";

import Spinner from "./Spinner";
import {
  SeatsioSeatingChart,
  SeatsioChartManager,
  SeatsioDesigner,
} from "@seatsio/seatsio-react";
import { SeatsioClient } from "seatsio";
const monday = mondaySdk();

const NewSeatMap = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [chartName, setChartName] = useState("Office seat map");

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        setLoading(false);
      }
    });
  }, []);

  return (
    <Box fill={true}>
      <Grid
        rows={["xxsmall", "full"]}
        columns={["3/4", "1/4"]}
        areas={[
          { name: "nav", start: [0, 0], end: [1, 0] },
          { name: "main", start: [0, 1], end: [1, 1] },
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
          <A href="/seatmap">Back</A>
        </Box>
        {/* <Box gridArea="header" background="brand" pad="medium">
          {loading && <Spinner />}
          <TextInput
            placeholder="type here"
            value={chartName}
            onChange={(event) => setChartName(event.target.value)}
          />
        </Box> */}
        <Box gridArea="main" background="light-2" fill={true} id="booxxxx">
          {!loading && settings && (
            <SeatsioDesigner
              secretKey={settings.seatsio_secret_key}
              id="booxxxx"
            />
          )}
        </Box>
      </Grid>
    </Box>
  );
};
export default NewSeatMap;
