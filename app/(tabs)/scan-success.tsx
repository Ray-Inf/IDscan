import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function ScanSuccess() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>✔️</Text>
            </View>
            <Text style={styles.title}>Identity Verified!</Text>
            <Text style={styles.details}>Name: XYZ</Text>
            <Text style={styles.details}>Section: CS</Text>
            <Text style={styles.details}>Reg No: 1234567</Text>
            <Text style={styles.details}>Scan Time: 12:00 pm</Text>
            <TouchableOpacity
                style={styles.button}
                onPress={() => router.push('/log-details')} // Navigate to Log Details screen
            >
                <Text style={styles.buttonText}>View Log Details</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E6E6FA',
    },
    iconContainer: {
        backgroundColor: '#32CD32',
        borderRadius: 50,
        padding: 20,
        marginBottom: 20,
    },
    icon: {
        fontSize: 50,
        color: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    details: {
        fontSize: 18,
        marginBottom: 5,
    },
    button: {
        backgroundColor: '#0BCE83',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
        marginTop: 20,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
