import React, { useState, useEffect } from "react";
import "../App.css";
import {
  Box,
  Heading,
  Button,
  Grommet,
  Anchor,
  Form,
  FormField,
  TextInput,
  Select,
  CheckBox,
  Grid,
} from "grommet";
import { Home } from "grommet-icons";

import mondaySdk from "monday-sdk-js";
import { navigate, A } from "hookrouter";

import Spinner from "./Spinner";
import ImageLabel from "./ImageLabel";

import { SeatsioClient } from "seatsio";
import slugify from "slugify";

const monday = mondaySdk();

const NewEvent = () => {
  // pick a seat map
  // select which period
  // social distance enforced?
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsioClient, setSeatsioClient] = useState(null);
  const [currentChart, setCurrentChart] = useState({});
  const [charts, setCharts] = useState([]);
  const [eventName, setEventName] = useState("");
  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedBoard, setSelectedBoard] = useState(null);

  useEffect(() => {
    monday.listen("settings", async (res) => {
      console.log("seeeet", res.data);
      setSettings(res.data);
      if (res.data.seatsio_workspace_key) {
        console.log("here");
        let client = new SeatsioClient(res.data.seatsio_secret_key);
        setSeatsioClient(client);
        let chrts = await client.charts.listFirstPage();
        console.log(chrts);
        setCharts(chrts.items.filter((c) => c.status === "PUBLISHED"));
        setLoading(false);
      }
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    monday.listen("context", (res) => {
      monday
        .api(`query { teams { id, name, picture_url } }`)
        .then((res) => {
          console.log("rees", res.data.teams[0]);
          setTeams(res.data.teams);
          setLoading(false);
        })
        .catch((err) => {
          console.log("aahah", err);
        });

      setLoading(true);
      monday
        .api(
          `query ($boardIds: [Int]) {
            boards (ids:$boardIds) {
                name,
                id
              }
            }`,
          { variables: { boardIds: res.data.boardIds } }
        )
        .then((res) => {
          console.log("rees", res.data.boards);
          setSelectedBoard(res.data.boards[0]);
          setLoading(false);
        });
    });
  }, []);

  const createNewEvent = async ({
    eventName,
    boardId,
    socialDistance,
    team,
    seatMap,
  }) => {
    //createevent on Seats.io
    let socialDistanceRuleSet = null;
    if (socialDistance) {
      socialDistanceRuleSet = Object.keys(seatMap.socialDistancingRulesets)[0];
    }
    let event = await seatsioClient.events.create(
      seatMap.key,
      slugify(eventName, { replacement: "-" }),
      false,
      socialDistanceRuleSet
    );
    console.log(event);
    navigate(`/event/rsvp/${event.key}`);
    //create group on Monday board
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
        <Box
          gridArea="nav"
          direction="row"
          align="center"
          background="light-2"
          pad="medium"
        >
          <A href="/"><Home/></A>
        </Box>
        <Box gridArea="header" background="brand" pad="medium">
          {loading && <Spinner />}
          <Heading color="white" margin="none">
            Create a new event
          </Heading>
        </Box>
        <Box gridArea="main" background="light-2" fill={true} pad="medium" id="booxxxx" align="center">
          <Form
            onSubmit={({ value }) => {
              console.log("Submit: ", value);
              createNewEvent({
                eventName: value.eventname,
                seatMap: value.seatmap,
                team: value.team,
                socialDistance: value.socialdistancing,
              });
            }}
          >
            <FormField
              name="eventname"
              label="Event name"
              required={true}
              placeholder="Week #36 starting Monday 7th Sept"
            />
            <FormField
              label="Pick a seat map"
              name="seatmap"
              component={Select}
              options={charts}
              labelKey="name"
              valueKey="key"
            />
            <FormField
              name="socialdistancing"
              component={CheckBox}
              pad={true}
              label="Social distancing enforced?"
            />
            <FormField label="Pick a team" width="medium">
              <Select
                name="team"
                // component={Select}
                options={teams}
                labelKey="name"
                valueKey="id"
                value={selectedTeam}
                onChange={({ value: nextValue }) => {
                  let t = teams.find((t) => t.id === nextValue.id);
                  setSelectedTeam(nextValue);
                }}
              >
                {(option, index, options, { active, disabled, selected }) => (
                  <ImageLabel src={option.picture_url} label={option.name} />
                )}
              </Select>
            </FormField>

            <Button type="submit" label="Create a new event" primary={true} />
          </Form>
        </Box>
      </Grid>
    </Box>
  );
};
export default NewEvent;
