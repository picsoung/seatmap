import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import { Box, Heading, Button, Grommet, Anchor, Text } from "grommet";
import { Cluster, Calendar, Ticket } from "grommet-icons";
import Spinner from "./Spinner"

const monday = mondaySdk();

const Home = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true)
  const [context, setContext] = useState(null)
  const [settings, setSettings] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  const [isSetupComplete, setSetupComplete] = useState(false)

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
      setLoading(false)
      if(res.data.seatsio_secret_key && res.data.seatsio_workspace_key){
        setSetupComplete(true)
      }
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
      direction="column"
      fill={true}
    >
      <Heading color="white" margin={{ bottom: "xsmall" }}>
        Welcome to SeatMap
      </Heading>
      <Heading color="white" size="small" level={3} margin={{ top: "xsmall" }}>
        when remotees come to visit HQ
      </Heading>
      {loading && <Spinner />}
      {!loading && isSetupComplete && (
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
                 Office Plans
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
      )}
      {!loading && !isSetupComplete && (
        <Box background="light-3" round="medium" pad="medium">
          <Heading color="status-error" margin={{ top: "xsmall" }}>
            Oops something went wrong
          </Heading>
          <Text>
            To continue using this app you first need to create a <a href="https://seats.io">seats.io</a>
            account.
          </Text>
          <Text>
            Once you have created you account open the Settings sidebar
            and fill up your details.
          </Text>
        </Box>
      )}
    </Box>
  );
};
export default Home;
