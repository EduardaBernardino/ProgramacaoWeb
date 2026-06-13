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
  // Estado que armazena o array com o histórico de compras do usuário
  const [historico, setHistorico] = useState<HistoricoCompra[]>([]);

  // --- BUSCA DOS DADOS ---
  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      // Obtém as compras filtradas pelo ID do usuário autenticado e salva no estado
      const dados = compraService.listarHistorico(usuario.uid);
      setHistorico(dados);
    }
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.headerRow}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Histórico</Text>

        {/* Redireciona o usuário para a tela que renderiza o gráfico de gastos */}
        <TouchableOpacity
          style={styles.chartButton}
          onPress={() => navigation.navigate('HistoryChart')}
        >
          <Text style={styles.chartButtonText}>📊 Gráfico</Text>
        </TouchableOpacity>
      </View>

      {/* --- RENDERIZAÇÃO DA LISTA --- */}
      <FlatList
        data={historico} // Array de dados que alimenta a lista
        keyExtractor={(item) => String(item.id)} // Define uma chave única (string) para cada item otimizar a performance
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => (
          // Componente visual (Card) repetido para cada compra do array
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.dateBadge}>
                <Text style={styles.dateText}>📅 {item.dataCompra}</Text>
              </View>
              {/* Tratamento simples no plural/singular baseado na quantidade */}
              <Text style={styles.itemCountText}>
                {item.quantidadeItens} {item.quantidadeItens === 1 ? 'produto' : 'produtos'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardFooter}>
              <Text style={styles.totalLabel}>Total da Compra</Text>
              <Text style={styles.totalValue}>R$ {item.totalCompra.toFixed(2)}</Text>
            </View>
          </View>
        )}
        // Componente exibido automaticamente pela FlatList caso o array 'historico' esteja vazio
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
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 3.84, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dateBadge: { backgroundColor: '#f1f5f9', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6 },
  dateText: { fontSize: 13, fontWeight: '600', color: '#475569' },
  itemCountText: { fontSize: 14, fontWeight: '500', color: '#64748b' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontSize: 13, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: '600' },
  totalValue: { fontSize: 18, fontWeight: '700', color: '#0f766e' },
  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 45, marginBottom: 12 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 15 },
  chartButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.15)' },
  chartButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
});