import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Box, Heading, Button, Grommet, Anchor } from "grommet";
import { Cluster, Calendar, Ticket } from "grommet-icons";

const monday = mondaySdk();

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(null)
  const [context, setContext] = useState(null)
  const [settings, setSettings] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
    });
  }, []);

  useEffect(()=>{
      monday
        .api(`query { me { id, name, photo_thumb } }`)
        .then((res) => {
          setCurrentUser(res.data.me)
          if(settings && settings.app_admin.teammates.includes(res.data.me.id.toString())){
            setIsAdmin(true)
          }
          setLoading(false);
        })
        .catch((err) => {
          console.log("monday api query me", err);
        });
  }, [settings])

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
        {!loading && isAdmin && (
          <>
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
              <Heading color="brand" size="small" level={3}>
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
        </>
        )}
          <Box
            margin="medium"
            pad="medium"
            round="large"
            background="light-3"
            align="center"
            width="medium"
          >
            <Ticket color="dark-3" size="xlarge" />
            <A href="/events" style={{ textDecoration: "none" }}>
            <Heading color="brand" size="small" level={3}>
              Book my seat
            </Heading>
            </A>
          </Box>

      </Box>
    </Box>
  );
};
export default Home;
