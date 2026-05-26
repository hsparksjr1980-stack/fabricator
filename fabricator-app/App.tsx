import { View, Text } from 'react-native';

export default function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 32,
          fontWeight: '700',
        }}
      >
        Fabricator Works
      </Text>
    </View>
  );
}