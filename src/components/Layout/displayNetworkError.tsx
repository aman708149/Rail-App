import { Alert } from 'react-native';

const displayNetworkError = (error: { response: any; message: string | string[]; }) => {
  if (!error?.response) {
    if (error?.message?.includes('timeout')) {
      Alert.alert('Network Error', 'The request timed out. Please try again later.');
    } else {
      Alert.alert(
        'Connection Error',
        'Cannot reach the server. Please check your internet connection.'
      );
    }
  }
};

export default displayNetworkError;
