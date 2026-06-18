import { View, Text } from 'react-native'
import React from 'react'
import MapSystem from './MapSystem/MapSystem';

const Main = () => {
  return (
    <View style={{flex: 1,paddingVertical: 40}}>
     <MapSystem/>
    </View>
  )
}

export default React.memo(Main);