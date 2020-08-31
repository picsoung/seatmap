import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Grid, Box, Heading, Button, Grommet, Text, Image } from "grommet";
import { Home, Add, Edit, View, Trash } from "grommet-icons";

import Spinner from "./Spinner";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import { SeatsioClient } from "seatsio";

const monday = mondaySdk();

const SeatMapScreen = () => {
  //check if workspace defined in database
  //if not defined create new workspace
  //active workspace
  //check if seatmap defined
  //if no seatmap defined create new

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [charts, setCharts] = useState([]);

  useEffect(() => {
    monday.listen("settings", async (res) => {
      console.log("seeeet", res.data);
      setSettings(res.data);
      setLoading(false);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let chrts = await client.charts.listFirstPage();
        console.log(chrts);
        setCharts(chrts.items);
      }
    });
  }, []);

  const deleteChart = async (chartKey) => {
    await seatsioClient.charts.moveToArchive(chartKey);
    let chrts = await seatsioClient.charts.listFirstPage();
    console.log(chrts);
    setCharts(chrts.items);
  };

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
      {/* <Box
        justify="center"
        align="center"
        background="brand"
        direction="column"
      > */}
      <Box
          gridArea="nav"
          direction="row"
          align="center"
          background="light-2"
          pad="medium"
        >
          <A href="/"><Home/></A>
        </Box>
      <Box gridArea="header" background="brand" align="center" >
        <Heading color="white" margin={{ bottom: "xsmall" }}>
          Manage office charts
        </Heading>
      </Box>
        {loading && <Spinner />}
        <Box gridArea="main" background="brand"> 
          <Box direction="row" pad="medium">
            {!loading &&
              charts &&
              charts.map((chart) => {
                console.log("chart", chart);
                return (
                  <Box
                    margin="medium"
                    pad="medium"
                    round="large"
                    background="light-3"
                    align="center"
                    // width="medium"
                    height={{ max: "medium" }}
                    key={chart.key}
                  >
                    <Box>
                      <Image
                        fit="contain"
                        a11yTitle="${chart.name}"
                        seatmap
                        src={chart.publishedVersionThumbnailUrl}
                      />
                    </Box>
                    <Heading color="dark-3" size="small" level={3}>
                      {chart.name}
                    </Heading>
                    <Box direction="row" gap="medium">
                      <Button
                        size="small"
                        icon={<Edit color="dark-3" />}
                        plain
                        onClick={() => {
                          navigate(`/seatmap/edit/${chart.key}`);
                        }}
                      />
                      {/* <Button
                        size="small"
                        icon={<View color="dark-3" />}
                        plain
                      /> */}
                      <Button
                        size="small"
                        icon={<Trash color="neutral-4" />}
                        plain
                        onClick={() => {
                          monday
                            .execute("confirm", {
                              message: `Are you sure you want to delete ${chart.name}?`,
                              confirmButton: "Let's go!",
                              cancelButton: "No way",
                              excludeCancelButton: false,
                            })
                            .then((res) => {
                              console.log(res.data);
                              if (res.data.confirm) {
                                deleteChart(chart.key);
                              }
                            });
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            {!loading && charts && (
              <Box
                margin="medium"
                pad="medium"
                round="large"
                background="light-6"
                align="center"
                width="medium"
                style={{height: 'fit-content'}}
              >
                <Button
                  color="dark-3"
                  size="small"
                  icon={<Add size="xlarge" />}
                  label="new chart"
                  plain
                  onClick={() => {
                    navigate(`/seatmap/new`);
                  }}
                />
              </Box>
            )}
          </Box>
          {!loading &&
            !settings &&
            (settings.seatsio_secret_key || settings.seatsio_workspace_key) && (
              <Box background="light-3" round="medium" pad="medium">
                <Heading color="status-error" margin={{ top: "xsmall" }}>
                  Oops something went wrong
                </Heading>
                <Text>
                  To continue using this app you first need to create a seats.io
                  account.
                </Text>
                <Text>
                  Once you have created you account open the Settings sidebar
                  and fill up your details.
                </Text>
              </Box>
            )}
        </Box>
      {/* </Box> */}
    </Grid>
  </Box>
  );
};
export default SeatMapScreen;
