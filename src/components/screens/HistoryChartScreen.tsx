import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { compraService, HistoricoCompra } from '../../services/compraService';

// BarChart só é importado no mobile — no web usamos um gráfico manual com View/CSS
const SmartBarChart = Platform.OS !== 'web'
    ? (require('react-native-chart-kit').BarChart as any)
    : null;

export default function HistoryChartScreen() {
  const navigation = useNavigation();
  const [dadosGrafico, setDadosGrafico] = useState({ labels: [''], datasets: [{ data: [0] }] });

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      compraService.listarHistoricoAsync(usuario.uid).then(dados => {
        processarDadosParaGrafico(dados);
      });
    }
  }, []);

  const processarDadosParaGrafico = (historico: HistoricoCompra[]) => {
    const gastosPorMes: { [key: string]: number } = {};

    historico.forEach(compra => {
      if (compra.dataCompra) {
        const partes = compra.dataCompra.split('/');
        if (partes.length === 3) {
          const chaveOrdenacao = `${partes[2]}-${partes[1]}`;
          const valorNumerico = Number(compra.totalCompra) || 0;
          gastosPorMes[chaveOrdenacao] = (gastosPorMes[chaveOrdenacao] || 0) + valorNumerico;
        }
      }
    });

    const chavesOrdenadas = Object.keys(gastosPorMes).sort().slice(-6);
    const mesesLabels = chavesOrdenadas.map(chave => {
      const [ano, mes] = chave.split('-');
      return `${mes}/${ano.substring(2)}`;
    });
    const valoresOrdenados = chavesOrdenadas.map(chave => gastosPorMes[chave]);

    if (chavesOrdenadas.length > 0) {
      setDadosGrafico({
        labels: mesesLabels,
        datasets: [{ data: valoresOrdenados }],
      });
    }
  };

  const temDados = dadosGrafico.datasets[0].data[0] !== 0;
  const labels = dadosGrafico.labels;
  const valores = dadosGrafico.datasets[0].data;
  const valorMax = Math.max(...valores, 1);

  // ─── GRÁFICO WEB ─────────────────────────────────────────────────────────────
  // Implementação manual com Views — não depende de SVG nem de libs nativas
  const GraficoWeb = () => (
      <View style={styles.graficoWebContainer}>
        {valores.map((valor, index) => {
          const alturaPercentual = (valor / valorMax) * 180;
          return (
              <View key={index} style={styles.barraColuna}>
                <Text style={styles.barraValor}>R${valor.toFixed(0)}</Text>
                <View style={[styles.barra, { height: alturaPercentual }]} />
                <Text style={styles.barraLabel}>{labels[index]}</Text>
              </View>
          );
        })}
      </View>
  );

  return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Análise de Gastos</Text>
          <View style={{ width: 60 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.chartTitle}>Gastos Mensais</Text>

          {temDados ? (
              Platform.OS === 'web' ? (
                  // Gráfico alternativo para web
                  <View style={styles.chartContainer}>
                    <GraficoWeb />
                  </View>
              ) : (
                  // Gráfico nativo para mobile
                  <View style={styles.chartContainer}>
                    <SmartBarChart
                        data={dadosGrafico}
                        width={Dimensions.get('window').width - 32}
                        height={280}
                        yAxisLabel="R$ "
                        yAxisSuffix=""
                        fromZero={true}
                        segments={4}
                        formatYLabel={(value: string): string => {
                          const num = parseFloat(value);
                          if (isNaN(num) || num === 0) return '0';
                          return Math.floor(num).toLocaleString('pt-BR');
                        }}
                        chartConfig={{
                          backgroundColor: '#fff',
                          backgroundGradientFrom: '#fff',
                          backgroundGradientTo: '#fff',
                          backgroundGradientFromOpacity: 1,
                          backgroundGradientToOpacity: 1,
                          decimalPlaces: 0,
                          fillShadowGradient: '#0b5345',
                          fillShadowGradientOpacity: 1,
                          color: (opacity = 1) => `rgba(15, 118, 110, ${opacity * 0.15})`,
                          labelColor: () => '#475569',
                          barPercentage: 0.55,
                          style: { borderRadius: 16 },
                          propsForLabels: { dx: -8 },
                        }}
                        style={{ marginVertical: 8, borderRadius: 16 }}
                    />
                  </View>
              )
          ) : (
              <Text style={styles.emptyText}>Sem dados suficientes para gerar o gráfico.</Text>
          )}
        </View>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', paddingVertical: 18, paddingHorizontal: 15, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 25 },
  backButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)' },
  backButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#fff', textAlign: 'center', flex: 1 },
  content: { alignItems: 'center', paddingHorizontal: 16 },
  chartTitle: { fontSize: 16, fontWeight: '600', color: '#334155', marginBottom: 15, alignSelf: 'flex-start', paddingLeft: 4 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden', paddingRight: 12, width: '100%' },
  emptyText: { color: '#94a3b8', marginTop: 40, fontSize: 15 },

  // Estilos do gráfico web manual
  graficoWebContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 240, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  barraColuna: { alignItems: 'center', flex: 1, marginHorizontal: 4 },
  barra: { backgroundColor: '#0f766e', borderRadius: 6, width: '70%', minHeight: 4 },
  barraLabel: { marginTop: 6, fontSize: 11, color: '#475569', fontWeight: '600' },
  barraValor: { fontSize: 10, color: '#334155', marginBottom: 4, fontWeight: '600' },
});
