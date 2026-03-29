import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  PermissionsAndroid, Platform,
  ScrollView,
  Dimensions
} from 'react-native';

import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Feather from '@react-native-vector-icons/feather';
import Toast from 'react-native-toast-message';

import Geolocation, {
  GeoPosition,
  GeoCoordinates,
} from 'react-native-geolocation-service';
import axios from 'axios';
import { launchCamera, Asset } from 'react-native-image-picker';

type LocationCoords = GeoCoordinates;
const screenHeight = Dimensions.get('window').height;

interface TimeAttendance {
  empName?: string;
  empId?: string;
  totalHrs?: string;
  checkIn?: string;
  checkOut?: string;
};

const CameraScreen: React.FC = () => {

  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [photo, setPhoto] = useState<string | null>(null); // base64 string
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeAttendance, setTimeAttendance] = useState<TimeAttendance | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = currentTime.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

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
        setHasPermission(true); //Now it will properly update
      } else {
        Toast.show({
          type: 'error',
          text1: 'Permission required!',
        });
      }
    } catch (err) {
      Toast.show({
        type: 'error',
        text1: String(err),
      });
    }
  };

  const getLocation = (): Promise<LocationCoords> => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => resolve(position.coords),
        error => reject(error),
        {
          enableHighAccuracy: true,
          timeout: 20000,
          maximumAge: 0,
          distanceFilter: 0
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
        location: {
          lat: coords.latitude,
          lng: coords.longitude,
          accuracy: coords.accuracy,
        },
        photo: base64Image
      };
      // 4. Send to API
      const response = await axios.post(
        'https://3aq9qolzw0.execute-api.us-east-1.amazonaws.com/cpta/ta',
        payload
      );
      if (response.status === 200) {
        const taResponse =
          typeof response.data.data === 'string'
            ? JSON.parse(response.data.data)
            : response.data.data;
        setTimeAttendance(taResponse);
        Toast.show({
          type: 'success',
          text1: 'Clock-in recorded!',
        });

        setTimeout(() => {
          setPhoto(null);
          setLocation(null);
        }, 5000);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to capture!',
        });
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Failed to capture!',
      });
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

  const insets = useSafeAreaInsets();
  const now = new Date();

  const formattedDate = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const getGreeting = () => {
    const hour = now.getHours();

    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 + insets.bottom }}>

        {/* HEADER */}
        <LinearGradient
          colors={['#dff5f2', '#f5efe6']}
          style={styles.header}
        >
          <View style={styles.headerRow}>

            {/* LEFT SIDE */}
            <View>
              <View style={styles.row}>
                <Feather name="calendar" size={14} color="#777" />
                <Text style={styles.date}>{formattedDate}</Text>
              </View>
              <View style={styles.row}>
                <Feather name="sun" size={16} color="#ffb300" />
                <Text style={styles.greeting}>{getGreeting()}</Text>
              </View>
            </View>

            {/* RIGHT SIDE */}
            <View style={styles.timeContainer}>
              <Feather name="clock" size={18} color="#333" />
              <Text style={styles.time}>{formattedTime}</Text>
            </View>

          </View>
        </LinearGradient>

        {/* IMAGE PREVIEW (40% screen) */}
        <TouchableOpacity
          style={styles.previewContainer}
          onPress={handleClockIn}
          activeOpacity={0.8}
        >
          {photo ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${photo}` }}
              style={styles.previewImage}
            />
          ) : (
            <View style={styles.placeholderContainer}>
              <Feather name="camera" size={40} color="#ccc" />
              <Text style={styles.placeholderText}>No Image Captured</Text>
              <Text style={styles.ctaText}>
                Tap to capture
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* EMPLOYEE INFO */}
        <View style={styles.employeeContainer}>
          <View style={styles.infoRow}>
            <Feather name="user" size={16} color="#ff6b2d" />
            <Text style={styles.employeeName}>{timeAttendance?.empName || 'Employee Name'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Feather name="hash" size={16} color="#ff6b2d" />
            <Text style={styles.employeeId}>{timeAttendance?.empId || 'Emp Id'}</Text>
          </View>

          <View style={styles.workHoursBox}>
            <Feather name="clock" size={14} color="#ff6b2d" />
            <Text style={styles.workHoursText}>
              {timeAttendance?.totalHrs || '0h 0m'}
            </Text>
          </View>
        </View>

        {/* CHECK IN / CHECK OUT */}
        <View style={styles.timeRow}>

          {/* CHECK IN */}
          <View style={styles.timeBox}>
            <View style={styles.labelContainer}>
              <Feather name="clock" size={12} color="#ff6b2d" />
              <Text style={styles.timeLabelText}>Check In</Text>
            </View>
            <Text style={styles.timeValue}>{timeAttendance?.checkIn || '--:--'}</Text>
          </View>

          {/* CHECK OUT */}
          <View style={styles.timeBox}>
            <View style={styles.labelContainer}>
              <Feather name="clock" size={12} color="#ff6b2d" />
              <Text style={styles.timeLabelText}>Check Out</Text>
            </View>
            <Text style={styles.timeValue}>{timeAttendance?.checkOut || '--:--'}</Text>
          </View>

        </View>
      </ScrollView>

      {/* FLOATING BUTTON */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 30 }]} onPress={handleClockIn}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Feather name="plus" size={24} color="#fff" />
        )}
      </TouchableOpacity>

      {/* BOTTOM NAV */}
      <View style={[styles.bottomNav, { height: 60 + insets.bottom, paddingBottom: insets.bottom }]}>
        {/* <NavItem icon="home" label="Home" />
            <NavItem icon="calendar" label="Calendar" />
            <NavItem icon="credit-card" label="Wallet" />
            <NavItem icon="menu" label="More" /> */}
      </View>
    </SafeAreaView>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  date: {
    fontSize: 12,
    color: '#777',
    marginLeft: 6,
  },

  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 5,
    marginLeft: 6,
  },

  time: {
    fontSize: 32,
    fontWeight: '600',
    color: '#555',
    marginLeft: 6,
    letterSpacing: 1
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ctaText: {
    color: '#ff6b2d',
    marginTop: 6,
    fontWeight: '600',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#fafafa'
  },

  placeholderText: {
    marginTop: 10,
    color: '#999',
    fontSize: 14,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },

  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },

  employeeId: {
    fontSize: 14,
    color: '#777',
    marginLeft: 8,
  },
  employeeContainer: {
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  workHoursBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#fff5ef',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  workHoursText: {
    marginLeft: 6,
    color: '#ff6b2d',
    fontWeight: '500',
  },
  labelContainer: {
    position: 'absolute',
    top: -10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f6f6f6',
    paddingHorizontal: 6,
  },

  timeLabelText: {
    fontSize: 12,
    color: '#ff6b2d',
    marginLeft: 4,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    alignSelf: 'center',
    marginTop: 20,
  },

  timeBox: {
    width: '48%',
    borderWidth: 2,
    borderColor: '#ff6b2d',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#fff',
  },

  timeLabel: {
    position: 'absolute',
    top: -10,
    backgroundColor: '#f6f6f6', // match screen bg
    paddingHorizontal: 8,
    fontSize: 12,
    color: '#ff6b2d',
  },

  timeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  previewContainer: {
    width: '80%',
    height: screenHeight * 0.4,
    marginTop: 10,
    alignSelf: 'center'
  },

  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },

  locationContainer: {
    padding: 15,
    backgroundColor: '#fff',
    margin: 15,
    borderRadius: 12,
  },

  locationText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  absCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    width: '30%',
  },
  absValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  absTitle: {
    fontSize: 12,
    color: '#777',
  },
  hoursCard: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hoursText: {
    fontSize: 16,
    fontWeight: '500',
  },
  clockBtn: {
    backgroundColor: '#ff6b2d',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 20,
  },
  section: {
    paddingHorizontal: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  requestItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  reqTitle: {
    fontWeight: '500',
  },
  reqStatus: {
    color: '#888',
  },
  form: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#f3f3f3',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  submitBtn: {
    backgroundColor: '#1e1b2e',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#1e1b2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  fab: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: '#ff6b2d',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  navText: {
    color: '#fff',
  },
  navItem: {
    alignItems: 'center',
  },
});
