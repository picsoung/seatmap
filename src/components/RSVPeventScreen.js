import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Text,
  Image,
  Button,
  Heading,
  Form,
  FormField,
  Markdown,
} from "grommet";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import Spinner from "./Spinner";
import ImageLabel from "./ImageLabel";

import { SeatsioClient } from "seatsio";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";

const monday = mondaySdk();
const RSVPeventScreen = ({ eventKey }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [currentChart, setCurrentChart] = useState({});
  const [currentEvent, setCurrentEvent] = useState({});
  const [eventName, setEventName] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
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

  useEffect(()=>{
    if(seatsioClient && currentUser){
      let order = seatsioClient.eventReports.byOrderId(eventKey, currentUser.name).then((order)=>{
        if(order && order[currentUser.name]){ //order exists
          console.log('order exists', order[currentUser.name][0])
          setExistingOrder(order[currentUser.name][0])
        }
        return order
      })
    }
  }, [seatsioClient, currentUser])

  const bookSeat = async () => {
    let orderId = `${currentUser.name}`
    let bookedObject = await seatsioClient.events.book(eventKey, [selectedObject.id], null,orderId );
    console.log(bookedObject)
    setSelectedObject(null)
    setExistingOrder(bookedObject.objects[selectedObject.id])
    monday.execute("notice", { 
      message: "Your seat has been booked 🎉.",
      type: "success", // or "error" (red), or "info" (blue)
      timeout: 10000,
    });
    addToBoard(bookedObject.objects[selectedObject.id])
    //check if group exists in board.
    //create group if needed
    //add item to board
  }

  const releaseSeat = async () => {
    let orderId = `${currentUser.name}`
    let releasedObject = await seatsioClient.events.release(eventKey, [existingOrder.label]);
    console.log(releasedObject)
    if(releasedObject && releasedObject.objects[existingOrder.label].status === "free"){
      setExistingOrder(null)
      monday.execute("notice", { 
        message: "Your spot has been released 🙏.",
        type: "success", // or "error" (red), or "info" (blue)
        timeout: 10000,
     });
    }
  }

  const addToBoard = async (obj) => {
    //check for groups
    monday
        .api(`query ($boardId: [Int]) {
          boards (ids:$boardId) {
             id
             groups{
               id,
               title
             }
           }
         }`,
         { variables: { boardId: context.boardId } }
         )
        .then((res) => {
          console.log("groooups", res.data.boards[0].groups, context.boardId);
          let groups = res.data.boards[0].groups
          let existingGroup = groups.find((g)=>g.title === currentEvent.key)
          if(!existingGroup){
            //create group
            monday.setToken('eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjcxMjMxMjA5LCJ1aWQiOjU2MTMzOTMsImlhZCI6IjIwMjAtMDgtMjFUMDE6MDg6NTEuMDAwWiIsInBlciI6Im1lOndyaXRlIn0.4rKYyGyAssnpX2r4GdfWa4DTU_NoCFvxzIs-UA2vY6w')
            monday.api(`mutation {
                create_group (board_id: $boardId, group_name: "new group") {
                  id
                }
              }`,{ variables: { boardId: context.boardId } }).then((result)=>{
                console.log('result', result)
              })
          }
          // setCurrentUser(res.data.me)
          // setLoading(false);
        })
        .catch((err) => {
          console.log("aahah", err);
        });
  }

  const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  return (
    <Box fill={true}>
      <Grid
        rows={["xsmall", "full"]}
        columns={["3/4", "1/4"]}
        areas={[
          { name: "header", start: [0, 0], end: [1, 0] },
          { name: "main", start: [0, 1], end: [0, 1] },
          { name: "sidebar", start: [1, 1], end: [1, 1] },
        ]}
        fill={true}
      >
        <Box gridArea="header" background="brand" justify="center">
          {loading && <Spinner />}
          <Heading color="white" margin="medium">
            {currentEvent.key}
          </Heading>
        </Box>
        <Box
          gridArea="main"
          background="light-2"
          fill={true}
          id="seating_chart_box"
        >
          {loading && <Spinner />}
          {!loading && settings && (
            <SeatsioSeatingChart
              workspaceKey={settings.seatsio_workspace_key}
              event={eventKey}
              id="seating_chart_box"
              maxSelectedObjects={1}
              onObjectSelected={(obj) => {
                console.log(obj);
                setSelectedObject(obj);
              }}
            />
          )}
        </Box>
        <Box gridArea="sidebar" background="light-4" fill={true}>
          {selectedObject && (
            <Box margin="medium">
              <Heading size="small">Book your seat</Heading>
              <Box>
                <Heading level="3" margin="none">Details</Heading>
                <Text color="dark-4" size="medium"><strong>Name:</strong> {selectedObject.label}</Text>
                <Text color="dark-4" size="medium"><strong>Type:</strong> {selectedObject.category.label}</Text>
                <Box align="center" direction="row">
                  <Text color="dark-4" size="medium"><strong>Who:</strong></Text>
                  <Image height={"30px"} margin="xxsmall" src={currentUser.photo_thumb}/>
                  <Text color="dark-4" size="medium">{currentUser.name}</Text>
                </Box>
              </Box>
              <Button type="submit" label="Book my seat" primary={true} margin="medium" onClick={()=>{
                bookSeat();
              }}/>
            </Box>
          )}

          {!loading && existingOrder && (
            <Box margin="medium">
              <Heading size="small">Your spot</Heading>
              <Box>
                  <Heading level="3" margin="none">Details</Heading>
                  <Text color="dark-4" size="medium"><strong>Category:</strong> {existingOrder.categoryLabel}</Text>
                  <Text color="dark-4" size="medium"><strong>{capitalize(existingOrder.labels.parent.type)}:</strong> {existingOrder.labels.parent.label}</Text>
                  <Text color="dark-4" size="medium"><strong>{capitalize(existingOrder.labels.own.type)}:</strong> {existingOrder.labels.own.label}</Text>
                  <Text color="dark-4" size="medium"><strong>Status:</strong> {existingOrder.status}</Text>
                  <Button type="submit" label="Release my seat" primary={true} margin="medium" onClick={()=>{
                    releaseSeat();
                  }}/>
              </Box>
            </Box>
          )}      
        </Box>
      </Grid>
    </Box>
  );
};
export default RSVPeventScreen;
