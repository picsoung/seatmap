import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Box, Heading, Button, Grommet, Anchor } from "grommet";
import { Cluster, Calendar } from "grommet-icons";

const monday = mondaySdk();

const Home = () => {

  const [currentUser, setCurrentUser] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null)
  const [context, setContext] = useState(null)

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let event = await client.events.retrieve(eventKey);
        setCurrentEvent(event);
        setLoading(false);
      }
    });
    monday.listen("context", async(res) => {
      console.log('context', res.data)
      setContext(res.data)
      monday
        .api(`query { me { id, name, photo_thumb } }`)
        .then((res) => {
          console.log("rees", res.data.me);
          setCurrentUser(res.data.me)
          setLoading(false);
        })
        .catch((err) => {
          console.log("aahah", err);
        });
    })
  }, []);
  return (
    <Box
      justify="center"
      align="center"
      pad="xlarge"
      background="brand"
      //   round="large"
    //   fill={true}
      direction="column"
    >
      <Heading color="white" margin={{ bottom: "xsmall" }}>
        Welcome to SeatMap
      </Heading>
      <Heading color="white" size="small" level={3} margin={{ top: "xsmall" }}>
        when remotees come to visit HQ
      </Heading>
      <Box direction="row" pad="medium">
        <Box
          justify="center"
          align="center"
          margin="medium"
          pad="medium"
          round="large"
          background="light-3"
          align="center"
          width="medium"
        >
          <Cluster color="dark-3" size="xlarge" />
          <A href="/seatmap" style={{ textDecoration: "none" }}>
            <Heading color="dark-3" size="small" level={3}>
              New SeatMap
            </Heading>
          </A>
        </Box>
        <Box
          margin="medium"
          pad="medium"
          round="large"
          background="light-3"
          align="center"
          width="medium"
        >
          <Calendar color="dark-3" size="xlarge" />
          <A href="/event/new" style={{ textDecoration: "none" }}>
          <Heading color="brand" size="small" level={3}>
            New Event
          </Heading>
          </A>
        </Box>
      </Box>
    </Box>
  );
};
export default Home;
