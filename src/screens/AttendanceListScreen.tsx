import React from 'react';
import { View, Text, FlatList, StyleSheet, Image } from 'react-native';

interface EmployeeAttendance {
  id: string;
  name: string;
  image?: string;
  checkIn?: string;
  checkOut?: string;
  totalHrs?: string;
}

const data: EmployeeAttendance[] = [
  {
    id: '1',
    name: 'Joyson Fernandes',
    checkIn: '10:30 AM',
    checkOut: '06:30 PM',
    totalHrs: '8h 0m',
  },
  {
    id: '2',
    name: 'John Doe',
    checkIn: '09:15 AM',
    totalHrs: '3h 20m',
  },
];

const AttendanceListScreen = () => {

  const renderItem = ({ item }: { item: EmployeeAttendance }) => (
    <View style={styles.card}>

      {/* LEFT IMAGE */}
      <View style={styles.imageContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={{ color: '#999' }}>👤</Text>
          </View>
        )}
      </View>

      {/* RIGHT CONTENT */}
      <View style={styles.info}>
        <Text style={styles.name}>{item.name}</Text>

        <Text style={styles.text}>
          Check In: {item.checkIn || '--:--'}
        </Text>

        <Text style={styles.text}>
          Check Out: {item.checkOut || '--:--'}
        </Text>

        <Text style={styles.total}>
          Total: {item.totalHrs || '0h 0m'}
        </Text>
      </View>

    </View>
  );

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 15 }}
    />
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
    width: '15%', // 🔥 ~10–15% as you wanted
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
});