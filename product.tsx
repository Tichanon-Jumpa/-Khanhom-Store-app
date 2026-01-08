import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

const API_BASE_URL = 'http://nindam.sytes.net:3013/api';

const COLORS = {
  bg: '#FFF9FB', 
  card: '#FFFFFF',  
  primary: '#FF6FAF', 
  accent: '#FFD66B',  
  text: '#4B2E2B',  
  textMuted: '#A88C8C', 
  border: '#F5D9E0', 
  chip: '#FFE8F0', 
  inputBg: '#FFF2F6',  
};

interface ProductType {
  id: number;
  name: string;
  imageUrl: string;
  stock: string;
  catagory: string;
  location: string;
  status: string;
}

const Chip: React.FC<{ text: string; tone?: 'pink' | 'yellow' }> = ({ text, tone = 'pink' }) => (
  <View style={[
    styles.chip,
    tone === 'yellow' && { backgroundColor: COLORS.accent, borderColor: '#FBCF5A' },
  ]}>
    <Text style={[
      styles.chipText,
      tone === 'yellow' && { color: '#5B3B00' },
    ]}>{text}</Text>
  </View>
);

export default function ProductListPage() {
  const router = useRouter();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const fade = useRef(new Animated.Value(0)).current;

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE_URL}/products`);
      const data = await res.json();
      if (!Array.isArray(data)) return setProducts([]);
      setProducts(data.map((p: any) => ({
        id: Number(p.ID ?? p.id ?? 0),
        name: p.Name ?? p.name ?? '',
        imageUrl:
          typeof p.Image === 'string' && p.Image.startsWith('http')
            ? p.Image
            : p.Image
              ? `${API_BASE_URL}${p.Image}`
              : '',
        stock: String(p.Stock ?? p.stock ?? ''),
        catagory: p.Catagory ?? p.category ?? '',
        location: p.location ?? p.Location ?? '',
        status: p.status ?? p.Status ?? '',
      })));
    } catch (err) {
      console.error(err);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      Animated.timing(fade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, { method: 'DELETE' });
      if (res.ok) setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (e) { console.error(e); }
  };

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) =>
      [p.name, p.catagory, p.location, p.status, p.stock].join(' ').toLowerCase().includes(q)
    );
  }, [products, query]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 8, color: COLORS.textMuted }}>กำลังโหลดรายการ...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl tintColor={COLORS.textMuted} refreshing={refreshing} onRefresh={onRefresh} />}
      keyboardShouldPersistTaps="handled"
    >
      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="ค้นหาสินค้า..."
            placeholderTextColor={COLORS.textMuted}
            style={styles.searchInput}
          />
          {!!query && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>×</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.resultCount}>
        พบ {filteredProducts.length} รายการ{query ? ` สำหรับ "${query}"` : ''}
      </Text>

      <Animated.View style={{ opacity: fade }}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>ไม่พบสินค้าตรงกับคำค้น</Text>
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text style={[styles.emptyText, { textDecorationLine: 'underline' }]}>ล้างคำค้น</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => (
              <View key={product.id} style={styles.cardWrapper}>
                <TouchableOpacity style={styles.card} onPress={() => router.push(`/edit/${product.id}`)}>
                  <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
                  <View style={styles.meta}>
                    <Text style={styles.productName}>{product.name || '-'}</Text>

                    <View style={styles.badgeRow}>
                      {product.catagory ? <Chip text={product.catagory} /> : null}
                      {product.location ? <Chip text={product.location} tone="yellow" /> : null}
                      {product.status ? <Chip text={product.status} /> : null}
                    </View>

                    <View style={styles.actionRow}>
                      <Text style={[styles.stock, { color: '#4CAF50', fontWeight: '700' }]}>
                        สต็อก: {product.stock || '-'}
                      </Text>
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity style={styles.editButton} onPress={() => router.push(`/edit/${product.id}`)}>
                          <Text style={styles.actionText}>แก้ไข</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.delButton} onPress={() => handleDelete(product.id)}>
                          <Text style={styles.actionText}>ลบ</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, backgroundColor: COLORS.bg },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.bg },

  searchRow: { marginBottom: 12 },
  searchBox: {
    position: 'relative',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  searchInput: { color: COLORS.text, fontSize: 14, paddingRight: 28 },
  clearBtn: { position: 'absolute', right: 6, top: 0, bottom: 0, justifyContent: 'center', paddingHorizontal: 6 },
  clearText: { color: COLORS.textMuted, fontSize: 18, lineHeight: 18 },

  resultCount: { color: COLORS.textMuted, marginBottom: 8 },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  cardWrapper: { width: '48%', marginBottom: 16 },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 3,
  },
  productImage: { width: '100%', height: 150, backgroundColor: '#FFF4F6' },
  meta: { padding: 12 },
  productName: { fontSize: 15, fontWeight: '900', color: COLORS.text },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  chip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: COLORS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  chipText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  stock: { fontSize: 12 },
  editButton: {
    marginRight: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  delButton: {
    backgroundColor: COLORS.accent,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  actionText: { fontWeight: '800', color: '#4B2E2B' },
  emptyWrap: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { color: COLORS.textMuted, marginBottom: 6 },
});
