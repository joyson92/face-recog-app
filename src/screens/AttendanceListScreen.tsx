import Feather from '@react-native-vector-icons/feather';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { ActivityIndicator } from 'react-native';

interface EmployeeAttendance {
  id: string;
  name: string;
  image?: string;
  checkIn?: string;
  checkOut?: string;
  totalHrs?: string;
  isPresent?: boolean;
}

// const data: EmployeeAttendance[] = [
//   {
//     id: '1',
//     name: 'Joyson Fernandes',
//     checkIn: '10:30 AM',
//     checkOut: '06:30 PM',
//     totalHrs: '8h 0m',
//     isPresent: false
//   },
//   {
//     id: '2',
//     name: 'John Doe',
//     checkIn: '09:15 AM',
//     totalHrs: '3h 20m',
//     isPresent: true
//   },
// ];

const AttendanceListScreen = () => {

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [attendanceList, setAttendanceList] = useState<EmployeeAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const formatDisplayDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';

    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
  };

  const goToPreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const goToNextDay = () => {
    const today = new Date();

    if (selectedDate.toDateString() === today.toDateString()) return;

    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const fetchAttendance = async (date: Date) => {
    try {
      setLoading(true);

      const formattedDate = formatDateForAPI(date);

      const response = await axios.get(
        `https://3aq9qolzw0.execute-api.us-east-1.amazonaws.com/cpta/ta/attendance?date=${formattedDate}`
      );

      const data =
        typeof response.data === 'string'
          ? JSON.parse(response.data)
          : response.data;

      setAttendanceList(data || []);
    } catch (error) {
      setAttendanceList([]);
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch attendance',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate]);

  const isToday =
    selectedDate.toDateString() === new Date().toDateString();

  const renderItem = ({ item }: { item: EmployeeAttendance }) => (
    <View style={styles.card}>

      {/* LEFT IMAGE */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: '#999' }}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>

      {/* MIDDLE CONTENT */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        {/* CHECK IN / OUT SAME LINE */}
        <View style={styles.timeRow}>
          <Text style={styles.timeText}>
            {item.checkIn || '--:--'}
          </Text>

          <Text style={styles.arrow}>→</Text>

          <Text style={styles.timeText}>
            {item.checkOut || '--:--'}
          </Text>
        </View>

        <Text style={styles.total}>
          Total: {item.totalHrs || '0h 0m'}
        </Text>
      </View>

      {/* RIGHT STATUS ICON */}
      <View style={styles.statusContainer}>
        <Feather
          name={item.isPresent ? 'check-circle' : 'x-circle'}
          size={20}
          color={item.isPresent ? 'green' : 'red'}
        />
      </View>

    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f6f6f6' }}>
      <View style={styles.dateNav}>

        {/* LEFT */}
        <TouchableOpacity onPress={goToPreviousDay}>
          <Feather name="chevron-left" size={22} color="#ff6b2d" />
        </TouchableOpacity>

        {/* CENTER */}
        <Text style={styles.dateText}>
          {formatDisplayDate(selectedDate)}
        </Text>

        {/* RIGHT */}
        <TouchableOpacity onPress={goToNextDay} disabled={isToday}>
          <Feather name="chevron-right" size={22} color={isToday ? '#ccc' : '#ff6b2d'} />
        </TouchableOpacity>

      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#ff6b2d" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={attendanceList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          refreshing={loading}
          onRefresh={() => fetchAttendance(selectedDate)}
          ListEmptyComponent={() => (
            <Text style={{ textAlign: 'center', marginTop: 20 }}>
              No attendance records
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

export default AttendanceListScreen;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 3,
  },

  imageContainer: {
    width: '15%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },

  placeholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },

  info: {
    flex: 1,
    marginLeft: 10,
  },

  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },

  text: {
    fontSize: 13,
    color: '#555',
  },

  total: {
    marginTop: 5,
    fontWeight: '600',
    color: '#ff6b2d',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },

  timeText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  arrow: {
    marginHorizontal: 8,
    color: '#999',
  },

  statusContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusIcon: {
    width: 24,
    height: 24,
  },
  dateNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderColor: '#eee',
  },

  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});