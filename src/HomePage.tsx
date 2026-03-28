import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';

interface AbsenceCardProps {
  title: string;
  value: string;
}

interface RequestItemProps {
  title: string;
  status: string;
}

const AbsenceCard: React.FC<AbsenceCardProps> = ({ title, value }) => (
  <View style={styles.absCard}>
    <Text style={styles.absValue}>{value}</Text>
    <Text style={styles.absTitle}>{title}</Text>
  </View>
);

const RequestItem: React.FC<RequestItemProps> = ({ title, status }) => (
  <View style={styles.requestItem}>
    <Text style={styles.reqTitle}>{title}</Text>
    <Text style={styles.reqStatus}>{status}</Text>
  </View>
);

const HomePage: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* HEADER */}
        <LinearGradient
          colors={['#dff5f2', '#f5efe6']}
          style={styles.header}
        >
          <Text style={styles.date}>Friday, June 7</Text>
          <Text style={styles.greeting}>Good Morning, Evan</Text>

          <View style={styles.cardRow}>
            <AbsenceCard title="Holidays" value="8" />
            <AbsenceCard title="Sick Leave" value="24" />
            <AbsenceCard title="WHF" value="20" />
          </View>
        </LinearGradient>

        {/* HOURS */}
        <View style={styles.hoursCard}>
          <Text style={styles.hoursText}>0h 30m</Text>
          <TouchableOpacity style={styles.clockBtn}>
            <Text style={{ color: '#fff' }}>Clock in</Text>
          </TouchableOpacity>
        </View>

        {/* REQUEST LIST */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>My Request</Text>

          <RequestItem title="Sick Leave" status="Pending" />
          <RequestItem title="Paid Vacation" status="Approved" />
          <RequestItem title="WHF" status="Rejected" />
        </View>

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.formTitle}>Request day</Text>

          <TextInput placeholder="Select policy" style={styles.input} />
          <TextInput placeholder="Start date" style={styles.input} />
          <TextInput placeholder="End date" style={styles.input} />

          <View style={styles.switchRow}>
            <Text>All Day</Text>
            <Switch />
          </View>

          <TextInput
            placeholder="Enter reason"
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <TouchableOpacity style={styles.submitBtn}>
            <Text style={{ color: '#fff' }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* FLOATING BUTTON */}
      <TouchableOpacity style={styles.fab}>
        <Text style={{ color: '#fff', fontSize: 22 }}>+</Text>
      </TouchableOpacity>

      {/* BOTTOM NAV */}
      <View style={styles.bottomNav}>
        <Text style={styles.navText}>Home</Text>
        <Text style={styles.navText}>Calendar</Text>
        <Text style={styles.navText}>Wallet</Text>
        <Text style={styles.navText}>More</Text>
      </View>
    </SafeAreaView>
  );
};

export default HomePage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6f6f6',
  },
  header: {
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  date: {
    fontSize: 12,
    color: '#777',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    marginVertical: 5,
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
  fab: {
    position: 'absolute',
    bottom: 60,
    alignSelf: 'center',
    backgroundColor: '#ff6b2d',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#1e1b2e',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navText: {
    color: '#fff',
  },
});