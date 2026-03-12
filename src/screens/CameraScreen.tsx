import React, {useRef, useEffect} from 'react'
import {View, Button, StyleSheet} from 'react-native'
import {Camera, useCameraDevices} from 'react-native-vision-camera'
import RNFS from 'react-native-fs'

const CameraScreen = () => {

  const devices = useCameraDevices()
  const device = devices.back
  const camera = useRef<Camera>(null)
  
  const [permission, setPermission] = useState(false)

  useEffect(() => {
    const getPermission = async () => {
      const status = await Camera.requestCameraPermission()
      setPermission(status === 'granted')
    }
    getPermission()
  }, [])
  
  if (!permission) {
    return <Text>Camera permission required</Text>
  }
  
  if (device == null) {
    return <Text>Loading camera...</Text>
  }

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

    } catch (error) {
      console.error(error)
    }

  }

  const takePhoto = async () => {

    if (!camera.current) return

    const photo = await camera.current.takePhoto()

    const base64 = await RNFS.readFile(photo.path, 'base64')

    await sendToAWS(base64)

  }

  if (device == null) return null

  return (
    <View style={{flex:1}}>

      <Camera
        ref={camera}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        photo={true}
      />

      <Button title="Capture" onPress={takePhoto} />

    </View>
  )
}

export default CameraScreen