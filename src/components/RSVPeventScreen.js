import React, { useState, useEffect } from "react";
import {
  Grid,
  Box,
  Text,
  Image,
  Button,
  Heading,
  Meter,
  Stack
} from "grommet";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import Spinner from "./Spinner";

import { SeatsioClient } from "seatsio";
import { SeatsioSeatingChart } from "@seatsio/seatsio-react";

import { Home } from "grommet-icons";

const monday = mondaySdk();
const RSVPeventScreen = ({ eventKey }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({});
  const [eventName, setEventName] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);
  const [selectedObject, setSelectedObject] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [existingOrder, setExistingOrder] = useState(null)
  const [context, setContext] = useState(null)
  const [eventSummary, setEventSummary] = useState(null)

  useEffect(() => {
    monday.listen("settings", async (res) => {
      setSettings(res.data);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let event = await client.events.retrieve(eventKey);
        event.title = event.key.replace('-',' ')
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

  useEffect(()=>{
    if(seatsioClient && currentUser){
      let summary = seatsioClient.eventReports.summaryByStatus(eventKey).then((sum)=>{
        console.log(sum)
        let r = {}
        if(!sum.booked){
          r = {
            value: 100,
            label: 'free'
          }
        }else if(!sum.free){
          r = {
            value: 100,
            label: 'booked'
          }
        }else{
          r = {
            value: (sum.booked.count/(sum.booked.count+sum.free.count))*100,
            label: 'booked'
          }
        }
        setEventSummary(r)
        return sum
      });
  }
}, [seatsioClient, currentUser, existingOrder])

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
      removeFromBoard()
    }
  }

  const createGroup = async (boardId, groupName) => {
    return monday.api(`mutation {
      create_group (board_id: ${boardId}, group_name: "${groupName}") {
        id
      }
    }`).then((result)=>{
      console.log('result', result)
      return result.data.create_group
    }).catch((err)=>{
      console.log('errr', err)
    })
  }
  const addToBoard = async (orderObject) => {
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
        .then(async (res) => {
          console.log("groooups", res.data.boards[0].groups, context.boardId, currentEvent.key);
          let groups = res.data.boards[0].groups
          let existingGroup = groups.find((g)=>g.title === currentEvent.key)
          if(!existingGroup){
            existingGroup = await createGroup(context.boardId, currentEvent.key)
          }
          let column_values = {
            'table__7': orderObject.labels.parent.label,
            'numbers': orderObject.labels.own.label,
            'date4': {
              'date': new Date().toLocaleDateString('fr-CA')
            },
            "person": {
              "personsAndTeams":[{
                "id": currentUser.id,
                "kind": "person"
              }]
            }
          }
          monday.api(`mutation {
            create_item (board_id: ${context.boardId}, group_id: "${existingGroup.id}", item_name: "${currentUser.name}", column_values: ${JSON.stringify(JSON.stringify(column_values))}) {
              id
              }
          }`).then((result)=>{
            console.log('result', result)
          }).catch((err)=>{
            console.log('errr', err)
          })
        })
        .catch((err) => {
          console.log("aahah", err);
        });
  }

  const removeFromBoard = ()=> {
     monday
     .api(`query {
        items_by_column_values (board_id: ${context.boardId}, column_id: "name", column_value: "${currentUser.name}") {
          id
          name,
            group {
              id,
              title
            }
          }
      }`
      )
     .then(async (res) => {
       let itemsInGroup = res.data.items_by_column_values.map((i)=>{
        if(i.group.title === currentEvent.key){ //only items of the same group
          return i.id
        }
       })
       itemsInGroup.map((item)=>{
        monday.api(`mutation {
             delete_item (item_id: ${item}) {
               id
               }
           }`).then((result)=>{
             console.log('result delete_item', result)
           }).catch((err)=>{
             console.log('err delete_item', err)
           })
       })
     })
     .catch((err) => {
       console.log("err query", err);
     });
  }

  const capitalize = (text) => {
    return text.charAt(0).toUpperCase() + text.slice(1)
  }

  return (
    <Box fill={true}>
      <Grid
        rows={["xxsmall", "xsmall", "full"]}
        columns={["3/4", "1/4"]}
        areas={[
          { name: "nav", start: [0, 0], end: [1, 0] },
          { name: "header", start: [0, 1], end: [1, 1] },
          { name: "main", start: [0, 2], end: [0, 2] },
          { name: "sidebar", start: [1, 2], end: [1, 2] }
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
          <A href="/events">Events</A>
        </Box>
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
          {eventSummary &&(
            <Box pad="medium">
              <Heading size="small">Event summary</Heading>
              <Stack anchor="center">
                <Meter
                  type="circle"
                  background="light-2"
                  values={[{ value:  eventSummary.value}]}
                  size="xsmall"
                  thickness="small"
                />
                <Box direction="row" align="center" pad={{ bottom: 'xsmall' }}>
                  <Text size="xlarge" weight="bold">
                    {Math.floor(eventSummary.value)}
                  </Text>
                  <Text size="small">% {eventSummary.label}</Text>
                </Box>
              </Stack>
              {/* <Meter type="circle" background="light-2" values={[{ value: eventSummary.booked.count }]} /> */}
            </Box>
          )}
          {selectedObject && !existingOrder && (
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
                  <Text color="dark-4" size="medium"><strong>Type:</strong> {existingOrder.categoryLabel}</Text>
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
