import { Feather } from '@expo/vector-icons';
import { Slot, useRouter, useSegments } from 'expo-router';
import React from 'react';
import { Platform, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const COLORS = {
  bg: '#FFF8F8', 
  card: '#FFFFFF', 
  primary: '#FF6FAF', 
  accent: '#FFD6A5',
  text: '#4A3C3C',
  textMuted: '#A08080',
  border: '#F2D7D9',
};

const Header = () => {
  const segments = useSegments();
  let title = 'Khanhom Store';
  if (segments.length > 0 && segments[0]) {
    switch (segments[0]) {
      case 'product': title = 'Products'; break;
      case 'addproduct': title = 'Add Product'; break;
      case 'edit': title = 'Edit Product'; break;
    }
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <Feather name="heart" size={22} color={COLORS.primary} />
        <Text style={styles.logoText}>Khanhom Store</Text>
      </View>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={{ width: 22 }} />
    </View>
  );
};

const Footer = () => {
  const router = useRouter();
  const segments = useSegments();
  const currentRoute = segments[0] || 'index';

  const items = [
    { label: 'Home', iconName: 'home', path: '/' },
    { label: 'Add', iconName: 'plus', path: '/addproduct' },
    { label: 'Products', iconName: 'tag', path: '/product' },
    { label: 'Categories', iconName: 'grid', path: '/category' },
  ];

  return (
    <View style={styles.footer}>
      {items.map((item, i) => {
        const active = (currentRoute === item.path.replace('/', '')) || (item.path === '/' && currentRoute === 'index');
        return (
          <TouchableOpacity key={i} style={styles.footerItem} onPress={() => router.push(item.path)}>
            <Feather
              name={item.iconName as any}
              size={22}
              color={active ? COLORS.primary : COLORS.textMuted}
            />
            <Text style={[styles.footerLabel, active && styles.footerLabelActive]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default function Layout() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.card} />
      <Header />
      <View style={styles.slotContainer}><Slot /></View>
      <Footer />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg, paddingTop: Platform.OS === 'web' ? 0 : StatusBar.currentHeight },
  header: {
    height: 78, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: COLORS.card, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  logoText: { marginLeft: 10, fontSize: 20, fontWeight: '900', color: COLORS.primary, letterSpacing: 0.5 },
  headerTitle: {
    position: 'absolute', left: 0, right: 0, textAlign: 'center',
    fontSize: 16, color: COLORS.text, fontWeight: '700',
  },
  slotContainer: { flex: 1 },
  footer: {
    height: 74, backgroundColor: COLORS.card, borderTopWidth: 1, borderTopColor: COLORS.border,
    flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 4,
  },
  footerItem: { alignItems: 'center' },
  footerLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 4 },
  footerLabelActive: { color: COLORS.primary, fontWeight: '800' },
});
