import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { compraService, HistoricoCompra } from '../../services/compraService';

export default function HistoryScreen() {
  const navigation = useNavigation<any>();
  const [historico, setHistorico] = useState<HistoricoCompra[]>([]);

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      const dados = compraService.listarHistorico(usuario.uid);
      setHistorico(dados);
    }
  }, []);

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Histórico</Text>

          <TouchableOpacity
              style={styles.chartButton}
              onPress={() => navigation.navigate('HistoryChart')}
          >
            <Text style={styles.chartButtonText}>📊 Gráfico</Text>
          </TouchableOpacity>
        </View>

        <FlatList
            data={historico}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
            renderItem={({ item }) => (
                <View style={styles.card}>
                  {/* Cabeçalho: data e quantidade de produtos */}
                  <View style={styles.cardHeader}>
                    <View style={styles.dateBadge}>
                      <Text style={styles.dateText}>📅 {item.dataCompra}</Text>
                    </View>
                    <Text style={styles.itemCountText}>
                      {item.quantidadeItens} {item.quantidadeItens === 1 ? 'produto' : 'produtos'}
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  {/* Badge de divergência — linha própria, visível acima do total */}
                  {item.divergencia > 0 && (
                      <View style={styles.divergenciaBadge}>
                        <Text style={styles.divergenciaText}>
                          ⚠️ Cobrado R$ {item.divergencia.toFixed(2)} a mais no caixa
                        </Text>
                      </View>
                  )}

                  {/* Total da compra — sempre na última linha do card */}
                  <View style={styles.cardFooter}>
                    <Text style={styles.totalLabel}>Total da Compra</Text>
                    <Text style={styles.totalValue}>R$ {item.totalCompra.toFixed(2)}</Text>
                  </View>
                </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📜</Text>
                <Text style={styles.emptyText}>Você ainda não fechou nenhuma compra.</Text>
              </View>
            }
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', paddingVertical: 18, paddingHorizontal: 15, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3, marginBottom: 15 },
  backButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  backButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center' },
  chartButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  chartButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 3.84, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBadge: { backgroundColor: '#f1f5f9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  itemCountText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  divergenciaBadge: { backgroundColor: '#fee2e2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 10, marginBottom: 10, alignSelf: 'stretch' },
  divergenciaText: { fontSize: 12, fontWeight: '600', color: '#991b1b' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#0f766e' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 45, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 15 },
});
