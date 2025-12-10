import useAutoUpdatingTimestamp from '@/src/hooks/useAutoUpdatingTimestamp';
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';

export default function DigitalClockwithHHMMSSA() {
  const timeStamp = useAutoUpdatingTimestamp();
  const [currentTime, setCurrentTime] = useState(
    new Date(timeStamp ?? new Date().getTime())
  );

  // Update when timestamp changes
  useEffect(() => {
    if (timeStamp) {
      setCurrentTime(new Date(timeStamp));
    }
  }, [timeStamp]);

  // Auto update clock every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(prevTime => {
        return new Date(prevTime.getTime() + 1000);
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!timeStamp) return <Text>Loading...</Text>;

  const hours = currentTime.getHours().toString().padStart(2, '0');
  const minutes = currentTime.getMinutes().toString().padStart(2, '0');
  const seconds = currentTime.getSeconds().toString().padStart(2, '0');

  return (
    <View className="mt-1  bg-white dark:bg-gray-800 dark:text-gray-200 gap-2">
      <Text className="text-center mb-2 text-base text-white">Current Time</Text>

      <View className="items-center">
        <Text className="text-sm font-bold flex-row text-white">
          <Text className="px-2 py-1 rounded bg-black/10 dark:bg-white/20">{hours}</Text>
          {' : '}
          <Text className="px-2 py-1 rounded bg-black/10 dark:bg-white/20">{minutes}</Text>
          {' : '}
          <Text className="px-2 py-1 rounded bg-black/10 dark:bg-white/20">{seconds}</Text>
        </Text>
      </View>
    </View>
  );
}
