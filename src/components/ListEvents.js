import React, { useState, useEffect } from "react";
import "../App.css";

import mondaySdk from "monday-sdk-js";
import { navigate } from "hookrouter";

import { Box, Heading, Button, Grommet, Text, Image } from "grommet";
import { Cluster, Add, Edit, View, Trash, Ticket } from "grommet-icons";

import Spinner from "./Spinner";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";
import { SeatsioClient } from "seatsio";

const monday = mondaySdk();

const ListEvents = () => {
  //check if workspace defined in database
  //if not defined create new workspace
  //active workspace
  //check if seatmap defined
  //if no seatmap defined create new

  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [events, setEvents] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false)
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    monday.listen("settings", async (res) => {
      console.log("seeeet", res.data);
      setSettings(res.data);
      setLoading(false);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let events = await client.events.listFirstPage();
        console.log(events);
        setEvents(events.items);
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

  const deleteEvent = async (eventKey) =>{
    await seatsioClient.events.delete(eventKey);
    let events = await seatsioClient.events.listFirstPage();
    console.log(events);
    setEvents(events.items);
  }

  return (
    <Box
      justify="center"
      align="center"
      background="brand"
      direction="column"
    >
      <Heading color="white" margin={{ bottom: "xsmall" }}>
        Events
      </Heading>
      {loading && <Spinner />}
      <Box>
        <Box direction="row" pad="medium">
          {!loading &&
            events &&
            events.map((event) => {
              console.log("event", events);
              return (
                  <Box
                    margin="medium"
                    pad="medium"
                    round="large"
                    background="light-3"
                    align="center"
                    // width="medium"
                    height={{ max: "medium" }}
                    key={event.id}
                  >
                    <Heading color="dark-3" size="small" level={3}>
                      {event.key}
                    </Heading>
                    <Box direction="row" gap="medium">
                        <Button size='small' icon={<Ticket color='dark-3'/>} plain onClick={()=> {navigate(`/event/rsvp/${event.key}`)}}/>
                        
                        {isAdmin && (<Button size='small' icon={<Trash color='neutral-4'/>} plain onClick={() =>{
                            monday.execute("confirm", {
                                message: `Are you sure you want to delete ${event.key}?`, 
                                confirmButton: "Let's go!", 
                                cancelButton: "No way", 
                                excludeCancelButton: false
                             }).then((res) => {
                                 console.log(res.data);
                                 if(res.data.confirm){
                                    deleteEvent(event.key)
                                 }
                             });
                        }}/>)}
                    </Box>
                  </Box>
              );
            })}
            {!loading && events && isAdmin &&(
                <Box
                margin="medium"
                pad="medium"
                round="large"
                background="light-6"
                align="center"
                width="medium"
                height={{ max: "medium" }}
                fill="vertical"
              >
                <Button color='dark-3' size='small' icon={<Add size='xlarge'/>} label="new event" plain onClick={()=> {navigate(`/event/new`)}}/>
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
                Once you have created you account open the Settings sidebar and
                fill up your details.
              </Text>
            </Box>
          )}
      </Box>
    </Box>
  );
};
export default ListEvents;
