import React, { useEffect, useState, useMemo } from 'react';
import { Platform } from 'react-native';
import { auth } from '../../services/firebase';
import { compraService } from '../../services/compraService';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    Keyboard,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { ItemCompra } from '../../services/compraService';

// Extensão da tipagem original para incluir o estado temporário do input do caixa
interface ItemConferencia extends ItemCompra {
    valorCaixa: string;
}

export default function CheckoutScreen() {
    const navigation = useNavigation<any>();
    const route = useRoute<any>();

    // Guard para evitar múltiplos cliques seguidos no envio do histórico (previne duplicidade no banco)
    const finalizandoRef = React.useRef(false);

    // Recupera a lista de produtos vinda da tela anterior via parâmetros de navegação
    const itensRecebidos: ItemCompra[] = route.params?.itens ?? [];

    // Define o estado inicial da tela mapeando os itens recebidos com o novo campo de input de texto vazio
    const [itens, setItens] = useState<ItemConferencia[]>(
        itensRecebidos.map((item) => ({ ...item, valorCaixa: '' }))
    );

    const [mensagemWeb, setMensagemWeb] = useState<string | null>(null);

    // Atualiza o preço cobrado no caixa de um item específico no array de estados
    const handleValorCaixaChange = (id: number | undefined, valor: string) => {
        if (!id) return;
        // Substitui a vírgula do padrão brasileiro por ponto para viabilizar cálculos matemáticos em JavaScript
        const valorNormalizado = valor.replace(',', '.');
        setItens((prev) =>
            prev.map((item) =>
                item.id === id ? { ...item, valorCaixa: valorNormalizado } : item
            )
        );
    };

    /**
     * useMemo: Otimiza e recalcula automaticamente os totais, diferenças matemáticas e validação
     * de integridade sempre que o estado 'itens' sofrer alterações, poupando processamento de re-render.
     */
    const { totalGondola, totalCaixa, diferenca, todosPreenchidos } = useMemo(() => {
        let totalGondola = 0;
        let totalCaixa = 0;
        let todosPreenchidos = true;

        itens.forEach((item) => {
            // Soma o total acumulado com base no preço cadastrado na gôndola do mercado
            totalGondola += item.precoUnitario * item.quantidade;
            const valorDigitado = parseFloat(item.valorCaixa);

            // Valida se o usuário deixou o campo vazio ou inseriu caracteres inválidos
            if (!item.valorCaixa || isNaN(valorDigitado)) {
                todosPreenchidos = false; // Sinaliza que a validação falhou
            } else {
                // Acumula o valor real total cobrado pelo operador de caixa
                totalCaixa += valorDigitado * item.quantidade;
            }
        });

        return {
            totalGondola,
            totalCaixa,
            diferenca: totalCaixa - totalGondola, // Se positivo: prejuízo/cobrança indevida. Se negativo: economia.
            todosPreenchidos
        };
    }, [itens]);

    // Abstração de Alertas para compatibilidade cross-platform (Web vs Mobile nativo)
    const mostrarAlerta = (titulo: string, mensagem: string, onOk?: () => void) => {
        if (Platform.OS === 'web') {
            window.alert(`${titulo}\n\n${mensagem}`);
            if (onOk) onOk();
        } else {
            if (onOk) {
                Alert.alert(titulo, mensagem, [{ text: 'OK', onPress: onOk }]);
            } else {
                Alert.alert(titulo, mensagem);
            }
        }
    };

    // Gera um relatório detalhado comparando o preço individual e global da compra
    const handleConferirCaixa = () => {
        if (!todosPreenchidos) {
            mostrarAlerta('Campos incompletos', 'Preencha o valor cobrado no caixa para todos os produtos antes de conferir.');
            return;
        }

        // Mapeia item por item gerando strings informativas sobre o status financeiro de cada produto
        const linhasResumo = itens.map((item) => {
            const valorCaixa = parseFloat(item.valorCaixa);
            const diffItem = valorCaixa - item.precoUnitario;
            const status = diffItem > 0
                ? `⚠️ +R$ ${diffItem.toFixed(2)}` // Produto mais caro no caixa
                : diffItem < 0
                    ? `✅ -R$ ${Math.abs(diffItem).toFixed(2)}` // Produto com desconto no caixa
                    : '✅ OK'; // Valores idênticos
            return `• ${item.nome}: ${status}`;
        });

        // Define a mensagem final macro baseada na diferença geral calculada no useMemo
        const statusGeral = diferenca > 0
            ? `⚠️ Você está sendo cobrado R$ ${diferenca.toFixed(2)} a mais!`
            : diferenca < 0
                ? `✅ Você está pagando R$ ${Math.abs(diferenca).toFixed(2)} a menos.`
                : '✅ Todos os valores conferem!';

        mostrarAlerta('Resumo da Conferência', `${linhasResumo.join('\n')}\n\n${statusGeral}`);
    };

    // Grava permanentemente a compra realizada no histórico local e limpa o carrinho
    const handleFinalizarCompra = async () => {
        if (finalizandoRef.current) return;
        finalizandoRef.current = true; // Ativa a trava de segurança contra cliques duplos

        if (!todosPreenchidos) {
            mostrarAlerta('Campos incompletos', 'Preencha o valor cobrado no caixa para todos os produtos antes de finalizar.');
            finalizandoRef.current = false;
            return;
        }

        const usuario = auth.currentUser;
        if (!usuario) {
            mostrarAlerta('Erro', 'Usuário não autenticado.');
            finalizandoRef.current = false;
            return;
        }

        try {
            // 1. Cria o cabeçalho principal da compra no histórico local e armazena o ID retornado
            const historicoId = await compraService.salvarHistoricoCompra({
                userId: usuario.uid,
                dataCompra: new Date().toLocaleDateString('pt-BR'),
                totalCompra: totalGondola,
                quantidadeItens: itens.length,
                divergencia: diferenca > 0 ? diferenca : 0, // Registra apenas prejuízos na métrica de divergência
            });

            // 2. Loop assíncrono para inserir todos os itens de forma vinculada ao ID do histórico gerado acima
            for (const item of itens) {
                await compraService.salvarItemHistorico({
                    historicoId,
                    nome: item.nome,
                    precoUnitario: item.precoUnitario,
                    quantidade: item.quantidade,
                    totalItem: item.totalItem,
                });
            }

            // 3. Esvazia de forma completa a lista corrente do usuário após persistir os dados com sucesso
            await compraService.limparListaUsuario(usuario.uid);

            mostrarAlerta(
                'Compra finalizada',
                'Sua lista foi salva no histórico e a lista atual foi limpa.',
                () => navigation.goBack() // Retorna o usuário para o painel principal
            );
        } catch (error) {
            console.error(error);
            mostrarAlerta('Erro', 'Não foi possível finalizar a compra.');
        } finally {
            finalizandoRef.current = false; // Libera o botão de finalizar caso novos fluxos ocorram
        }
    };

    // Função interna analítica para definir a variação de cores/estados baseada nos preços informados
    const getStatusItem = (item: ItemConferencia) => {
        const valor = parseFloat(item.valorCaixa);
        if (!item.valorCaixa || isNaN(valor)) return 'pendente';
        if (valor > item.precoUnitario) return 'divergencia';
        if (valor < item.precoUnitario) return 'menor';
        return 'ok';
    };

    const renderItem = ({ item }: { item: ItemConferencia }) => {
        const status = getStatusItem(item);
        return (
            <View style={styles.card}>
                <View style={styles.cardTop}>
                    {item.fotoUrl ? (
                        <Image source={{ uri: item.fotoUrl }} style={styles.cardImage} />
                    ) : (
                        <View style={styles.cardImagePlaceholder} />
                    )}
                    <View style={styles.cardInfo}>
                        <Text style={styles.cardNome} numberOfLines={1}>{item.nome}</Text>
                        <Text style={styles.cardQtd}>
                            Qtd: {item.quantidade} · Gôndola: R$ {item.precoUnitario.toFixed(2)}/un
                        </Text>
                    </View>
                    {status === 'ok' && <View style={[styles.badge, styles.badgeOk]}><Text style={styles.badgeOkText}>Correto</Text></View>}
                    {status === 'divergencia' && <View style={[styles.badge, styles.badgeErr]}><Text style={styles.badgeErrText}>Divergência</Text></View>}
                    {status === 'menor' && <View style={[styles.badge, styles.badgeOk]}><Text style={styles.badgeOkText}>Desconto</Text></View>}
                </View>

                <View style={styles.precos}>
                    <View style={styles.precoBox}>
                        <Text style={styles.precoLabel}>Gôndola</Text>
                        <Text style={styles.precoValor}>R$ {item.precoUnitario.toFixed(2)}</Text>
                    </View>
                    <View style={styles.precoBoxInput}>
                        <Text style={styles.precoLabel}>Caixa (cobrado)</Text>
                        <TextInput
                            style={styles.precoInput}
                            placeholder="0,00"
                            placeholderTextColor="#adb5bd"
                            keyboardType="numeric"
                            value={item.valorCaixa}
                            onChangeText={(v) => handleValorCaixaChange(item.id, v)}
                            returnKeyType="done"
                            onSubmitEditing={Keyboard.dismiss}
                        />
                    </View>
                </View>

                {status === 'divergencia' && (
                    <Text style={styles.statusErr}>
                        ⚠️ Cobrado R$ {(parseFloat(item.valorCaixa) - item.precoUnitario).toFixed(2)} a mais por unidade
                    </Text>
                )}
                {status === 'ok' && <Text style={styles.statusOk}>✓ Valor confere com a gôndola</Text>}
                {status === 'menor' && (
                    <Text style={styles.statusOk}>
                        ✓ Cobrado R$ {(item.precoUnitario - parseFloat(item.valorCaixa)).toFixed(2)} a menos por unidade
                    </Text>
                )}
                {status === 'pendente' && <Text style={styles.statusPendente}>Aguardando valor do caixa...</Text>}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>← Voltar</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Conferência no Caixa</Text>
                <View style={{ width: 60 }} />
            </View>

            <Text style={styles.instrucao}>
                Digite o valor que o caixa está cobrando por cada produto.
            </Text>

            <FlatList
                data={itens}
                keyExtractor={(item) => String(item.id)}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                keyboardShouldPersistTaps="handled"
            />

            <View style={styles.footer}>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Total esperado (gôndola)</Text>
                    <Text style={styles.footerValor}>R$ {totalGondola.toFixed(2)}</Text>
                </View>
                <View style={styles.footerRow}>
                    <Text style={styles.footerLabel}>Total cobrado (caixa)</Text>
                    <Text style={styles.footerValor}>R$ {todosPreenchidos ? totalCaixa.toFixed(2) : '--'}</Text>
                </View>

                {todosPreenchidos && (
                    <View style={styles.footerRow}>
                        <Text style={[styles.footerLabel, diferenca !== 0 && styles.footerLabelErr]}>
                            {diferenca > 0 ? 'Cobrança a maior' : diferenca < 0 ? 'Cobrança a menor' : 'Diferença'}
                        </Text>
                        <Text style={[styles.footerValor, diferenca > 0 && styles.footerValorErr, diferenca < 0 && styles.footerValorOk]}>
                            {diferenca > 0 ? '+' : ''}R$ {diferenca.toFixed(2)}
                        </Text>
                    </View>
                )}

                <TouchableOpacity style={styles.conferirBtn} onPress={handleConferirCaixa}>
                    <Text style={styles.confirmBtnText}>🔍 Conferir Caixa</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.confirmBtn} onPress={handleFinalizarCompra}>
                    <Text style={styles.confirmBtnText}>✓ Finalizar Compra</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1e293b', paddingVertical: 18, paddingHorizontal: 15, borderBottomLeftRadius: 16, borderBottomRightRadius: 16, marginBottom: 10 },
    backButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
    backButtonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
    headerTitle: { fontSize: 17, fontWeight: '700', color: '#fff' },
    instrucao: { fontSize: 13, color: '#64748b', textAlign: 'center', marginBottom: 10, paddingHorizontal: 20 },
    listContent: { paddingHorizontal: 15, paddingBottom: 20 },
    card: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
    cardTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    cardImage: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f1f5f9' },
    cardImagePlaceholder: { width: 48, height: 48, borderRadius: 10, backgroundColor: '#f1f5f9' },
    cardInfo: { flex: 1, marginLeft: 10 },
    cardNome: { fontSize: 14, fontWeight: '600', color: '#1e293b', marginBottom: 2 },
    cardQtd: { fontSize: 12, color: '#64748b' },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, marginLeft: 6 },
    badgeOk: { backgroundColor: '#d1fae5' },
    badgeErr: { backgroundColor: '#fee2e2' },
    badgeOkText: { fontSize: 10, fontWeight: '600', color: '#065f46' },
    badgeErrText: { fontSize: 10, fontWeight: '600', color: '#991b1b' },
    precos: { flexDirection: 'row', gap: 10, marginBottom: 8 },
    precoBox: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: 8, padding: 10 },
    precoBoxInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 8, padding: 10, borderWidth: 1, borderColor: '#e2e8f0' },
    precoLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 4 },
    precoValor: { fontSize: 15, fontWeight: '600', color: '#1e293b' },
    precoInput: { fontSize: 15, fontWeight: '600', color: '#1e293b', padding: 0 },
    statusOk: { fontSize: 12, color: '#0f766e', fontWeight: '500' },
    statusErr: { fontSize: 12, color: '#dc2626', fontWeight: '500' },
    statusPendente: { fontSize: 12, color: '#94a3b8' },
    footer: { backgroundColor: '#fff', padding: 16, borderTopWidth: 0.5, borderColor: '#e2e8f0' },
    footerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    footerLabel: { fontSize: 13, color: '#64748b' },
    footerLabelErr: { color: '#dc2626' },
    footerValor: { fontSize: 14, fontWeight: '600', color: '#1e293b' },
    footerValorErr: { color: '#dc2626' },
    footerValorOk: { color: '#0f766e' },
    conferirBtn: { backgroundColor: '#3b82f6', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 10 },
    confirmBtn: { backgroundColor: '#16a34a', borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
    confirmBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});