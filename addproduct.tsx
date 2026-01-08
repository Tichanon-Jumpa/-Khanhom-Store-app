import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  ActivityIndicator, Alert, Image, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:3013/api/products';

const COLORS = {
  bg: '#FFF8F5',
  card: '#FFFFFF',
  primary: '#FF69B4',
  accent: '#FFD1DC',
  text: '#4A4A4A',
  textMuted: '#A17F7F',
  border: '#F0E0E0',
  input: '#FFF2F2',
};

type KanhomForm = {
  name: string;
  stock: string;
  catagory: string;
  location: string;
  status: string;
};

export default function AddProductPage() {
  const [form, setForm] = useState<KanhomForm>({
    name: '', stock: '', catagory: '', location: '', status: '',
  });
  const [image, setImage] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const onChange = <K extends keyof KanhomForm>(k: K, v: KanhomForm[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: Platform.OS === 'web' ? true : false,
    });
    if (!res.canceled) {
      if (Platform.OS === 'web') {
        setImage({
          uri: `data:image/jpeg;base64,${res.assets[0].base64}`,
          name: res.assets[0].fileName || 'photo.jpg',
          type: 'image/jpeg',
        });
      } else {
        setImage(res.assets[0]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      return Alert.alert('กรอกไม่ครบ', 'กรุณาระบุชื่อสินค้า (Name)');
    }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('Name', form.name.trim());
      fd.append('Stock', form.stock ?? '');
      fd.append('Catagory', form.catagory ?? '');
      fd.append('location', form.location ?? '');
      fd.append('status', form.status ?? '');

      if (image?.uri) {
        if (image.uri.startsWith('data:')) {
          const blob = await (await fetch(image.uri)).blob();
          fd.append('Image', blob, image.name || 'photo.jpg');
        } else {
          const ext = (image.uri.split('.').pop() || 'jpg').toLowerCase();
          fd.append('Image', { uri: image.uri, name: `photo.${ext}`, type: image.type || 'image/jpeg' } as any);
        }
      }

      const res = await fetch(API_BASE_URL, { method: 'POST', body: fd });
      const txt = await res.text();
      let data: any;
      try { data = JSON.parse(txt); } catch { throw new Error('Invalid server response'); }

      if (!res.ok) {
        Alert.alert('บันทึกไม่สำเร็จ', data?.error || 'สร้างสินค้าไม่สำเร็จ');
      } else {
        Alert.alert('สำเร็จ', 'เพิ่มสินค้าเรียบร้อย!');
        setForm({ name: '', stock: '', catagory: '', location: '', status: '' });
        setImage(null);
      }
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>เพิ่มสินค้า (Kanhom)</Text>

      <View style={styles.card}>
        <Text style={styles.section}>ข้อมูลสินค้า</Text>
        <L label="Name">
          <I value={form.name} onChangeText={(t: string) => onChange('name', t)} placeholder="เช่น Oreo Mini Pack" />
        </L>
        <L label="Catagory (หมวด)">
          <I value={form.catagory} onChangeText={(t: string) => onChange('catagory', t)} placeholder="Snack / Drink / etc." />
        </L>
        <L label="Stock">
          <I value={form.stock} onChangeText={(t: string) => onChange('stock', t)} placeholder="เช่น 10 / In stock / Lot#A" />
        </L>
        <L label="location (ตำแหน่งเก็บ)">
          <I value={form.location} onChangeText={(t: string) => onChange('location', t)} placeholder="เช่น ชั้น2-แถวB" />
        </L>
        <L label="status (สถานะ)">
          <I value={form.status} onChangeText={(t: string) => onChange('status', t)} placeholder="เช่น Ready / Out of stock" />
        </L>

        <Text style={styles.label}>รูปภาพสินค้า (Image)</Text>
        {image?.uri && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
        <TouchableOpacity style={styles.btnSecondary} onPress={pickImage}>
          <Text style={styles.btnSecondaryText}>เลือกภาพ</Text>
        </TouchableOpacity>

        <View style={{ marginTop: 18 }}>
          {loading ? (
            <ActivityIndicator size="large" color={COLORS.primary} />
          ) : (
            <TouchableOpacity style={styles.btnPrimary} onPress={handleSubmit}>
              <Text style={styles.btnPrimaryText}>บันทึกสินค้า</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const L: React.FC<{ label: string; children: React.ReactNode; }> = ({ label, children }) => (
  <View style={{ marginBottom: 10 }}>
    <Text style={styles.label}>{label}</Text>
    {children}
  </View>
);

const I: React.FC<any> = (props) =>
  <TextInput {...props} placeholderTextColor={COLORS.textMuted} style={[styles.input, props.style]} />;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.bg },
  title: { fontSize: 24, fontWeight: '900', marginBottom: 16, color: COLORS.primary, textAlign: 'center' },
  section: { marginTop: 14, marginBottom: 6, color: COLORS.primary, fontWeight: '800' },
  label: { fontWeight: '600', fontSize: 13, marginBottom: 6, color: COLORS.textMuted },
  card: {
    backgroundColor: COLORS.card, borderRadius: 18, padding: 16, borderWidth: 1, borderColor: COLORS.border,
    shadowColor: '#F9D9D9', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3,
  },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, padding: 12,
    backgroundColor: COLORS.input, color: COLORS.text, fontSize: 15,
  },
  imagePreview: { width: '100%', height: 200, borderRadius: 12, marginVertical: 10, borderWidth: 1, borderColor: COLORS.border },
  btnPrimary: {
    backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 14,
    shadowColor: '#FFB6C1', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 4,
    borderWidth: 1, borderColor: COLORS.accent,
  },
  btnPrimaryText: { color: '#FFFFFF', fontWeight: '900', textAlign: 'center' },
  btnSecondary: {
    backgroundColor: COLORS.accent, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  btnSecondaryText: { color: COLORS.text, fontWeight: '700', textAlign: 'center' },
});
