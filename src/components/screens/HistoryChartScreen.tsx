import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { compraService, HistoricoCompra } from '../../services/compraService';

/**
 * Importação Condicional por Plataforma:
 * A biblioteca 'react-native-chart-kit' depende de dependências nativas (como react-native-svg).
 * Para evitar falhas críticas de compilação ou bundle na Web, o 'require' só é executado no Mobile.
 */
const SmartBarChart = Platform.OS !== 'web'
    ? (require('react-native-chart-kit').BarChart as any)
    : null;

export default function HistoryChartScreen() {
  const navigation = useNavigation();

  // Estado estruturado conforme o padrão exigido pelas bibliotecas de gráficos (Labels + Datasets)
  const [dadosGrafico, setDadosGrafico] = useState({ labels: [''], datasets: [{ data: [0] }] });

  // Dispara a busca do histórico de compras assim que o componente é montado na árvore
  useEffect(() => {
    const usuario = auth.currentUser;
    if (usuario) {
      compraService.listarHistoricoAsync(usuario.uid).then(dados => {
        processarDadosParaGrafico(dados); // Formata os dados brutos do banco
      });
    }
  }, []);

  /**
   * Transforma e agrupa o histórico de compras de formato individual para soma mensal acumulada.
   * Exemplo de Entrada: [{ totalCompra: 50, dataCompra: "15/05/2026" }, { totalCompra: 30, dataCompra: "20/05/2026" }]
   * Exemplo de Saída formatada: { labels: ["05/26"], datasets: [{ data: [80] }] }
   */
  const processarDadosParaGrafico = (historico: HistoricoCompra[]) => {
    const gastosPorMes: { [key: string]: number } = {};

    historico.forEach(compra => {
      if (compra.dataCompra) {
        const partes = compra.dataCompra.split('/'); // Transforma "DD/MM/AAAA" em ["DD", "MM", "AAAA"]
        if (partes.length === 3) {
          // Cria uma chave no padrão "AAAA-MM" para garantir uma ordenação alfabética cronológica correta
          const chaveOrdenacao = `${partes[2]}-${partes[1]}`;
          const valorNumerico = Number(compra.totalCompra) || 0;

          // Acumula os valores gastos dentro do mesmo mês corrente
          gastosPorMes[chaveOrdenacao] = (gastosPorMes[chaveOrdenacao] || 0) + valorNumerico;
        }
      }
    });

    // Filtra e ordena as chaves para pegar apenas os últimos 6 meses preenchidos (.slice(-6))
    const chavesOrdenadas = Object.keys(gastosPorMes).sort().slice(-6);

    // Converte as chaves de ordenação interna ("AAAA-MM") no padrão de exibição visual ("MM/AA")
    const mesesLabels = chavesOrdenadas.map(chave => {
      const [ano, mes] = chave.split('-');
      return `${mes}/${ano.substring(2)}`; // Pega apenas os dois últimos dígitos do ano (Ex: "2026" vira "26")
    });

    // Mapeia os valores financeiros correspondentes na mesma sequência ordenada dos meses
    const valoresOrdenados = chavesOrdenadas.map(chave => gastosPorMes[chave]);

    // Atualiza o estado caso existam registros válidos processados
    if (chavesOrdenadas.length > 0) {
      setDadosGrafico({
        labels: mesesLabels,
        datasets: [{ data: valoresOrdenados }],
      });
    }
  };

  // Variáveis computadas a cada render para facilitar o controle e validação de tela vazia
  const temDados = dadosGrafico.datasets[0].data[0] !== 0;
  const labels = dadosGrafico.labels;
  const valores = dadosGrafico.datasets[0].data;

  // Captura o maior valor do gráfico para calcular proporcionalmente a altura das colunas manuais da Web
  const valorMax = Math.max(...valores, 1);

  // ─── GRÁFICO WEB (Componente Interno) ──────────────────────────────────────
  // Renderização alternativa montada estritamente com Views empilhadas na base (flex-end)
  const GraficoWeb = () => (
      <View style={styles.graficoWebContainer}>
        {valores.map((valor, index) => {
          // Calcula a altura da barra em pixels com base no valor máximo (teto de 180px de altura)
          const alturaPercentual = (valor / valorMax) * 180;
          return (
              <View key={index} style={styles.barraColuna}>
                {/* Exibe o valor numérico inteiro acima de cada barra */}
                <Text style={styles.barraValor}>R${valor.toFixed(0)}</Text>
                {/* Aplica a altura calculada dinamicamente via estilo inline */}
                <View style={[styles.barra, { height: alturaPercentual }]} />
                {/* Rótulo do mês na base da coluna */}
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
                  <View style={styles.chartContainer}>
                    <GraficoWeb />
                  </View>
              ) : (
                  <View style={styles.chartContainer}>
                    <SmartBarChart
                        data={dadosGrafico}
                        width={Dimensions.get('window').width - 32} // Calcula a largura responsiva com base no device
                        height={280}
                        yAxisLabel="R$ "
                        yAxisSuffix=""
                        fromZero={true} // Força o gráfico a começar a contagem no ponto zero absoluto do eixo Y
                        segments={4}
                        formatYLabel={(value: string): string => {
                          const num = parseFloat(value);
                          if (isNaN(num) || num === 0) return '0';
                          return Math.floor(num).toLocaleString('pt-BR'); // Converte para o padrão numérico brasileiro
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
                          barPercentage: 0.55, // Controla a espessura das colunas no gráfico nativo
                          style: { borderRadius: 16 },
                          propsForLabels: { dx: -8 }, // Ajusta os textos do eixo Y para evitar cortes horizontais
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
  graficoWebContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', height: 240, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  barraColuna: { alignItems: 'center', flex: 1, marginHorizontal: 4 },
  barra: { backgroundColor: '#0f766e', borderRadius: 6, width: '70%', minHeight: 4 },
  barraLabel: { marginTop: 6, fontSize: 11, color: '#475569', fontWeight: '600' },
  barraValor: { fontSize: 10, color: '#334155', marginBottom: 4, fontWeight: '600' },
});