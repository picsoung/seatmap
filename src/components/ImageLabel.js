import React from "react";
import {
    Box,
    Text,
    Image
  } from "grommet";
  const ImageLabel = ({src, label}) => {
    return (
      <Box
        direction="row"
        height="xxsmall"
        align="start"
        width="medium"
      >
          <Box height="xxsmall">
            <Image fit="contain" fill={true} src={src} /> 
          </Box>
        <Text>{label}</Text>
    </Box>
    );
  };
  export default ImageLabel;