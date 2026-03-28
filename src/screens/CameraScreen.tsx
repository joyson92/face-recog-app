import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  Alert,
  PermissionsAndroid, Platform
} from 'react-native';

import Geolocation, {
  GeoPosition,
  GeoCoordinates,
} from 'react-native-geolocation-service';
import axios from 'axios';
import { launchCamera, Asset } from 'react-native-image-picker'; // ✅ added

type LocationCoords = GeoCoordinates;

const ClockInScreen: React.FC = () => {

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null); // base64 string
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const checkCameraPermission = async () => {
    if (Platform.OS === 'android') {
      const status = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.CAMERA
      );
      return status;
    }
    return true; // iOS handled differently
  };

  const checkLocationPermission = async () => {
    if (Platform.OS === 'android') {
      const fine = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return fine;
    }
    return true;
  };

  const requestPermissions = async () => {
    try {
      let cameraGranted = await checkCameraPermission();
      if (!cameraGranted) {
        const cameraResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        cameraGranted = cameraResult === PermissionsAndroid.RESULTS.GRANTED;
      }

      let locationGranted = await checkLocationPermission();
      if (!locationGranted) {
        const locationResult = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        locationGranted = locationResult === PermissionsAndroid.RESULTS.GRANTED;
      }

      if (cameraGranted && locationGranted) {
        setHasPermission(true); // ✅ Now it will properly update
      } else {
        Alert.alert('Permission required');
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", String(err));
    }
  };

  const getLocation = (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => resolve(position.coords),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  };

  // capture using image-picker
  const capturePhoto = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      launchCamera(
        {
          mediaType: 'photo',
          includeBase64: true,
          quality: 0.7,
          cameraType: 'front',
          maxWidth: 800,
          maxHeight: 800,
        },
        response => {
          if (response.didCancel) {
            return;
          } else if (response.errorCode) {
            reject(response.errorMessage);
          } else {
            const asset: Asset | undefined = response.assets?.[0];
            if (!asset?.base64) {
              reject('No base64 received');
            } else {
              resolve(asset.base64);
            }
          }
        }
      );
    });
  };

  const handleClockIn = async (): Promise<void> => {
    try {
      setLoading(true);

      // 1. Get location
      const coords = await getLocation();
      setLocation(coords);

      // 2. Capture photo (base64)
      const base64Image = await capturePhoto();
      if (!base64Image) return;

      setPhoto(base64Image);

      // 3. Prepare payload
      const payload = {
        type: 'clock_in',
        timestamp: new Date().toISOString(),
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        },
        photo: `data:image/jpeg;base64,${base64Image}`,
      };

      // 4. Send to API
      await axios.post(
        'https://uqm06v0voe.execute-api.us-east-1.amazonaws.com/soc/ta',
        payload
      );

      Alert.alert('Success', 'Clock-in recorded!');
    } catch (error) {
      Alert.alert('Error', String(error));
    } finally {
      setLoading(false);
    }
  };

  if (!hasPermission) {
    return (
      <View style={styles.center}>
        <Text>No permission granted</Text>
        <TouchableOpacity onPress={requestPermissions}>
          <Text style={{ color: 'blue' }}>Grant Permissions</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Preview */}
      {photo && (
        <Image
          source={{ uri: `data:image/jpeg;base64,${photo}` }}
          style={styles.preview}
        />
      )}

      {/* Button */}
      <TouchableOpacity style={styles.button} onPress={handleClockIn}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Clock In</Text>
        )}
      </TouchableOpacity>

      {/* Location */}
      {location && (
        <Text style={styles.locationText}>
          Lat: {location.latitude} | Lng: {location.longitude}
        </Text>
      )}
    </View>
  );
};

export default ClockInScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  preview: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    width: 80,
    height: 120,
    borderRadius: 10,
  },
  button: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#1E90FF',
    padding: 15,
    borderRadius: 10,
  },
  buttonText: { color: '#fff', fontSize: 16 },
  locationText: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    color: '#fff',
    fontSize: 12,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});