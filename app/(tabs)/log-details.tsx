import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';

export default function LogDetailsScreen() {
    const logData = [
        { id: '1', name: 'XYZ', checkIn: '12:00pm', checkOut: 'Not yet' },
        { id: '2', name: 'ABC', checkIn: '11:00am', checkOut: '11:15am' },
    ];

    const renderItem = ({ item }) => (
        <View style={styles.logItem}>
            <Text style={styles.logText}>{item.name}</Text>
            <Text style={styles.logText}>Check-in time: {item.checkIn}</Text>
            <Text style={styles.logText}>Check-out time: {item.checkOut}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Log Details</Text>
            <FlatList
                data={logData}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                style={styles.list}
            />
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Export to CSV</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#E6E6FA',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    list: {
        marginBottom: 20,
    },
    logItem: {
        backgroundColor: '#F0F0F0',
        padding: 15,
        borderRadius: 5,
        marginBottom: 10,
    },
    logText: {
        fontSize: 16,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#0BCE83',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
