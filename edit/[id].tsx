import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Button, Image, Platform,
  ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:3013/api';

type KanhomProduct = {
  ID: number;
  Name: string;
  Image: string | null;
  Stock: string;
  Catagory: string;
  location: string;
  status: string;
};

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [product, setProduct] = useState<KanhomProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState<any>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/products/${id}`);
        const data: KanhomProduct = await res.json();
        setProduct(data);
        if (data?.Image) setImage({ uri: data.Image });
      } catch (e) {
        Alert.alert('Error', 'ไม่สามารถโหลดข้อมูลสินค้าได้');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      base64: Platform.OS === 'web' ? true : false,
    });

    if (!result.canceled) {
      if (Platform.OS === 'web') {
        setImage({
          uri: `data:image/jpeg;base64,${result.assets[0].base64}`,
          name: result.assets[0].fileName || 'photo.jpg',
          type: 'image/jpeg',
        });
      } else {
        setImage(result.assets[0]);
      }
    }
  };

  const handleSave = async () => {
    if (!product) return;
    try {
      const formData = new FormData();
      formData.append('Name', product.Name ?? '');
      formData.append('Stock', product.Stock ?? '');
      formData.append('Catagory', product.Catagory ?? '');
      formData.append('location', product.location ?? '');
      formData.append('status', product.status ?? '');

      if (image?.uri) {
        if (image.uri.startsWith('data:')) {
          const blob = await (await fetch(image.uri)).blob();
          formData.append('Image', blob, image.name || 'photo.jpg');
        } else {
          const ext = (image.uri.split('.').pop() || 'jpg').toLowerCase();
          formData.append('Image', {
            uri: image.uri,
            name: `photo.${ext}`,
            type: image.type || 'image/jpeg',
          } as any);
        }
      }

      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        body: formData,
      });

      const text = await res.text();
      let data; try { data = JSON.parse(text); } catch { throw new Error('Invalid server response'); }
      if (!res.ok) throw new Error(data?.error || 'Update failed');

      Alert.alert('สำเร็จ', 'อัปเดตข้อมูลสินค้าเรียบร้อย!');
      router.back();
    } catch (e) {
      Alert.alert('Error', e instanceof Error ? e.message : String(e));
    }
  };

  if (loading) {
    return (
      <ActivityIndicator size="large" style={{ flex: 1, justifyContent: 'center', marginTop: 40 }} color="#FF80AB" />
    );
  }

  if (!product) return null;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>แก้ไขข้อมูลสินค้า 🍓</Text>

      <Text style={styles.label}>Name</Text>
      <TextInput
        style={styles.input}
        value={product.Name}
        onChangeText={(text) => setProduct({ ...product!, Name: text })}
      />

      <Text style={styles.label}>Catagory</Text>
      <TextInput
        style={styles.input}
        value={product.Catagory}
        onChangeText={(text) => setProduct({ ...product!, Catagory: text })}
      />

      <Text style={styles.label}>Stock</Text>
      <TextInput
        style={styles.input}
        value={String(product.Stock ?? '')}
        onChangeText={(text) => setProduct({ ...product!, Stock: text })}
        placeholder="เช่น 10 / In stock"
      />

      <Text style={styles.label}>location</Text>
      <TextInput
        style={styles.input}
        value={product.location}
        onChangeText={(text) => setProduct({ ...product!, location: text })}
      />

      <Text style={styles.label}>status</Text>
      <TextInput
        style={styles.input}
        value={product.status}
        onChangeText={(text) => setProduct({ ...product!, status: text })}
      />

      <Text style={styles.label}>Image</Text>
      {image?.uri && <Image source={{ uri: image.uri }} style={styles.imagePreview} />}
      <Button title="เลือกภาพใหม่" onPress={pickImage} color="#FF80AB" />

      <View style={{ marginTop: 25 }}>
        <Button title="บันทึกการเปลี่ยนแปลง" onPress={handleSave} color="#FF80AB" />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#FFF6F8' },
  title: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FF80AB',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: { fontWeight: '600', fontSize: 14, marginTop: 12, color: '#7B7B7B' },
  input: {
    borderWidth: 1,
    borderColor: '#FFD6E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    backgroundColor: '#FFFFFF',
    color: '#4A4A4A',
    fontSize: 15,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#FFD6E0',
  },
});
