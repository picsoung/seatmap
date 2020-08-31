import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate } from "hookrouter";

import { Grid, Box, Heading, Button, Grommet, TextInput, Image } from "grommet";
import { Cluster, Add, Edit, View } from "grommet-icons";

import Spinner from "./Spinner";
import { SeatsioSeatingChart, SeatsioChartManager, SeatsioDesigner} from "@seatsio/seatsio-react";
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
        <Box gridArea="header" background="brand" pad="medium">
            {loading && <Spinner />}    
            <TextInput placeholder="type here"
                value={chartName}
                onChange={event => setChartName(event.target.value)}
            />
        </Box>
        <Box gridArea="main" background="light-2" fill={true} id="booxxxx">
            {!loading && settings && (
                <SeatsioDesigner
                    secretKey={settings.seatsio_secret_key}
                    id="booxxxx"
                />
            )}
        </Box>
    </Box>
  );
};
export default NewSeatMap;
