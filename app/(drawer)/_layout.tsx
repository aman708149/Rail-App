// app/(drawer)/_layout.tsx  ← Must be inside (drawer) folder!

// import React from 'react';
// import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
// import { NavigationContainer } from '@react-navigation/native';
// import { Slot, useRouter } from 'expo-router';
// import { View, Text, Image, StyleSheet } from 'react-native';
// import { useRole } from '@/src/context/RoleProvider';  // ROLE SUPPORT
// import { Icon } from '@/src/components/Icon';

// const Drawer = createDrawerNavigator();

// function CustomDrawerContent(props: any) {
//     const router = useRouter();
//     const { user } = useRole();

//     return (
//         <DrawerContentScrollView {...props} contentContainerStyle={{ flex: 1, backgroundColor: '#1E202C' }}>

//             {/* USER INFO BOX */}
//             <View style={styles.userInfo}>
//                 <Image source={{ uri: 'https://via.placeholder.com/50' }} style={styles.avatar} />
//                 <Text style={styles.username}>{user?.userID || "Guest User"}</Text>
//                 <Text style={styles.email}>{user?.email || "no-email@domain.com"}</Text>
//             </View>

//             {/* STATIC MENU */}
//             <DrawerItem label="Home" icon={() => <Icon name="home" size={20} color="white" />} onPress={() => router.push('/tabs' as any)} labelStyle={styles.label} />
//             <DrawerItem label="Accounts" icon={() => <Icon name="account-group" size={20} color="white" />} onPress={() => router.push('/accounts' as any)} labelStyle={styles.label} />

//             {/* RAIL - OPENS PAGE /rail/index */}
//             <DrawerItem label="Rail" icon={() => <Icon name="train" size={20} color="white" />} onPress={() => router.push('/rail')} labelStyle={styles.label} />

//             {/* MORE STATIC LINKS */}
//             <DrawerItem label="Bus" icon={() => <Icon name="bus" size={20} color="white" />} onPress={() => router.push('/bus' as any)} labelStyle={styles.label} />
//             <DrawerItem label="Profile" icon={() => <Icon name="account-circle" size={20} color="white" />} onPress={() => router.push('/profile' as any)} labelStyle={styles.label} />
//         </DrawerContentScrollView>
//     );
// }

// export default function DrawerLayout() {
//     return (
//         <Drawer.Navigator
//             screenOptions={{ headerShown: false }}
//             drawerContent={(props) => <CustomDrawerContent {...props} />}
//         >
//             {/* Slot renders all screens inside Drawer */}
//            <Drawer.Screen name="agent" component={Slot} />
//         </Drawer.Navigator>
//     );
// }

// const styles = StyleSheet.create({
//     userInfo: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#2C2F3E', marginBottom: 16 },
//     avatar: { width: 50, height: 50, borderRadius: 25 },
//     username: { color: 'white', fontWeight: 'bold', fontSize: 16 },
//     email: { color: '#B0B3C6', fontSize: 12 },
//     label: { color: 'white', fontSize: 14 },
// });


import { Drawer } from "expo-router/drawer";
import CustomSidebar from "./CustomSidebar";

export default function DrawerLayout() {
  return (
    <Drawer
      drawerContent={() => <CustomSidebar />}
      screenOptions={{ headerShown: false }}
    >
      {/* Common Pages */}
      

      {/* Role Based Pages */}
      <Drawer.Screen name="admin" />
      <Drawer.Screen name="agent" />
      <Drawer.Screen name="partner" />
      <Drawer.Screen name="rail" />
    </Drawer>
  );
}

