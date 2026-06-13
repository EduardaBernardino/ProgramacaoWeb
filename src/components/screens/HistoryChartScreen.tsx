import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { BarChart } from 'react-native-chart-kit';
import { auth } from '../../services/firebase';
import { compraService, HistoricoCompra } from '../../services/compraService';

const SmartBarChart = BarChart as any;

export default function HistoryChartScreen() {
  const navigation = useNavigation();
  const [dadosGrafico, setDadosGrafico] = useState({ labels: [''], datasets: [{ data: [0] }] });

  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      // Busca o histórico de compras baseado no ID do usuário logado
      const historico = compraService.listarHistorico(usuario.uid);
      processarDadosParaGrafico(historico);
    }
  }, []);

  // --- LÓGICA PRINCIPAL DE TRATAMENTO DE DADOS ---
  const processarDadosParaGrafico = (historico: HistoricoCompra[]) => {
    const gastosPorMes: { [key: string]: number } = {};

    // 1. Agrupa os valores somando-os por mês/ano
    historico.forEach(compra => {
      if (compra.dataCompra) {
        const partes = compra.dataCompra.split('/'); // Transforma "25/07/2026" em ["25", "07", "2026"]
        if (partes.length === 3) {
          // Cria uma chave no formato "ANO-MES" (ex: "2026-07") para facilitar a ordenação alfabética padrão
          const chaveOrdenacao = `${partes[2]}-${partes[1]}`;
          const valorNumerico = Number(compra.totalCompra) || 0;

          // Soma o valor da compra na chave do mês correspondente
          gastosPorMes[chaveOrdenacao] = (gastosPorMes[chaveOrdenacao] || 0) + valorNumerico;
        }
      }
    });

    // 2. Ordena cronologicamente e limita aos últimos 6 meses
    const chavesOrdenadas = Object.keys(gastosPorMes).sort().slice(-6);

    // 3. Transforma as chaves "ANO-MES" no formato de exibição do gráfico (ex: "07/26")
    const mesesLabels = chavesOrdenadas.map(chave => {
      const [ano, mes] = chave.split('-');
      return `${mes}/${ano.substring(2)}`;
    });

    // 4. Mapeia os valores correspondentes já na ordem cronológica correta
    const valoresOrdenados = chavesOrdenadas.map(chave => gastosPorMes[chave]);

    // 5. Atualiza o estado se houver dados para renderizar o gráfico
    if (chavesOrdenadas.length > 0) {
      setDadosGrafico({
        labels: mesesLabels,
        datasets: [
          {
            data: valoresOrdenados,
          }
        ]
      });
    }
  };

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

        {/* Condicional que valida se o gráfico possui dados válidos antes de renderizar */}
        {dadosGrafico.datasets[0].data[0] !== 0 ? (
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
                return Math.floor(num).toLocaleString('pt-BR'); // Formata o eixo Y para o padrão brasileiro (ex: 1.500)
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
                style: {
                  borderRadius: 16,
                },
                propsForLabels: {
                  dx: -8
                }
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />
          </View>
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
  chartContainer: { backgroundColor: '#fff', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, overflow: 'hidden', paddingRight: 12 },
  emptyText: { color: '#94a3b8', marginTop: 40, fontSize: 15 }
});