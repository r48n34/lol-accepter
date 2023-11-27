import React from "react";
import { Window, Renderer, View, Text } from "@nodegui/react-nodegui"

const App = () => {
  return (
    <Window>
      <View style={viewStyle}>
      <Text id="label">Hello</Text>
      </View>
    </Window>
  )
};

const viewStyle = `
  width:50px;
  height:30px; 
  background-color: yellow;
`;

export default App