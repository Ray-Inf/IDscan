import { Stack } from 'expo-router';

export default function StackLayout() {
    return (
        <Stack
            screenOptions={{
                headerStyle: { backgroundColor: '#8D33FF' }, // Header background color
                headerTintColor: '#fff', // Header text and icon color
            }}
        >
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="id-scan" options={{ title: "ID Scan" }} />
            <Stack.Screen name="log-details" options={{ title: "Log Details" }} />
        </Stack>
    );
}
