import React from 'react'
import {View, Button, Alert} from 'react-native'
import {launchCamera} from 'react-native-image-picker'

const CameraScreen = () => {

  const sendToAWS = async (base64: string) => {

    try {

      const response = await fetch(
        "https://uqm06v0voe.execute-api.us-east-1.amazonaws.com/soc/ta",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            image: base64
          })
        }
      )

      const data = await response.json()

      console.log("AWS Response:", data)

      Alert.alert("Response", JSON.stringify(data))

    } catch (error) {
      console.error(error)
    }
  }

  const openCamera = () => {

    launchCamera(
      {
        mediaType: 'photo',
        includeBase64: true,
		maxWidth:800,
		maxHeight:800,
        cameraType: 'back',
        quality: 0.7
      },
      (response) => {

        if (response.didCancel) {
          console.log('User cancelled camera')
          return
        }

        if (response.errorCode) {
          console.log('Camera Error: ', response.errorMessage)
          return
        }

        const base64 = response.assets?.[0]?.base64

        if (base64) {
          console.log("Base64 length:", base64.length)
          sendToAWS(base64)
        }

      }
    )
  }

  return (
    <View style={{flex:1, justifyContent:'center', alignItems:'center'}}>
      <Button title="Open Camera" onPress={openCamera}/>
    </View>
  )
}

export default CameraScreen