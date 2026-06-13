import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Keyboard,
<<<<<<< HEAD
  SafeAreaView
=======
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
// REMOVIDO: importações do Firebase
import { compraService, ItemCompra } from '../../services/compraService';

export default function ListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const [produtos, setProdutos] = useState<ItemCompra[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

<<<<<<< HEAD
  // Busca a lista filtrada do banco de dados local
  const carregarItensDoBancoLocal = async () => {
    // Como o app agora é offline, usamos um ID fixo para o aparelho
    const dados = await compraService.listarItensPorUsuario('local_user');
    setProdutos(dados);
=======
  // Busca os itens ativos salvos no banco local SQLite do dispositivo
  const carregarItensDoBancoLocal = () => {
    const usuarioLogado = auth.currentUser;
    if (usuarioLogado) {
      const dados = compraService.listarItensPorUsuario(usuarioLogado.uid);
      setProdutos(dados);
    } else {
      Alert.alert('Sessão Expirada', 'Por favor, realize o login novamente.');
      navigation.navigate('Login');
    }
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
  };

  // Monitora se a tela recebeu uma foto vinda da tela de Câmera para abrir o formulário
  useEffect(() => {
    if (route.params?.fotoUrl) {
      setFotoUrl(route.params.fotoUrl);
      setModalVisivel(true);
    }
  }, [route.params?.fotoUrl]);

  useEffect(() => {
    carregarItensDoBancoLocal();
  }, []);

  // Calcula em tempo real a soma acumulada de todos os itens do carrinho
  const valorTotalCompra = produtos.reduce((acc, item) => acc + item.totalItem, 0);

  // --- INTERAÇÕES COM O BANCO DE DADOS LOCAL (SQLITE) ---

  const handleSalvarItem = async () => {
<<<<<<< HEAD
    if (!nome || !preco || !quantidade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
=======
    Keyboard.dismiss();
    const usuarioLogado = auth.currentUser;

    if (!usuarioLogado) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!nome.trim() || !preco.trim() || !quantidade.trim() || !fotoUrl) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e capture a foto do produto.');
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
      return;
    }

    try {
      setLoading(true);
      // Sanitiza a string do preço para converter o padrão de moeda PT-BR para número decimal (Float) válido
      const precoLimpo = preco.replace('R$', '').replace(',', '.').trim();
      const valorUnitario = parseFloat(precoLimpo);
      const qtd = parseInt(quantidade.trim(), 10);

      if (isNaN(valorUnitario) || isNaN(qtd) || valorUnitario <= 0 || qtd <= 0) {
        Alert.alert('Erro', 'Verifique os valores inseridos no preço e quantidade.');
        setLoading(false);
        return;
      }

      const totalItemCalculado = valorUnitario * qtd;

      // Grava o item estruturado na tabela temporária do carrinho
      await compraService.salvarItemLocal({
        userId: 'local_user', // ID fixo offline
        nome: nome.trim(),
        precoUnitario: valorUnitario,
        quantidade: qtd,
        fotoUrl: fotoUrl,
        totalItem: totalItemCalculado,
      });

      // Reseta o formulário e fecha o modal
      setNome('');
      setPreco('');
      setQuantidade('');
      setFotoUrl('');
      setModalVisivel(false);

<<<<<<< HEAD
      await carregarItensDoBancoLocal();
=======
      carregarItensDoBancoLocal(); // Atualiza a FlatList com o novo item adicionado
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
      Alert.alert('Sucesso', 'Item adicionado à sua lista local!');
    } catch (error) {
      console.error("Erro ao salvar no SQLite: ", error);
      Alert.alert('Erro Local', 'Não foi possível gravar os dados.');
    } finally {
      setLoading(false);
    }
  };

  const handleExcluirItem = (id: number | undefined) => {
    if (!id) return;

    Alert.alert(
      'Remover Item',
      'Tem certeza que deseja tirar este produto da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sim, remover',
          style: 'destructive',
          onPress: async () => {
            try {
              await compraService.excluirItemLocal(id);
<<<<<<< HEAD
              await carregarItensDoBancoLocal(); // Atualização dinâmica automática
=======
              carregarItensDoBancoLocal(); // Atualiza o estado da lista após a remoção
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível excluir the item.');
            }
          }
        }
      ]
    );
  };

  const handleLimparLista = () => {
    const usuarioLogado = auth.currentUser;
    if (!usuarioLogado) return;

    Alert.alert(
      'Limpar Lista',
      'Deseja remover todos os itens da lista?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: async () => {
            try {
              await compraService.limparListaUsuario(usuarioLogado.uid);
              carregarItensDoBancoLocal();
              Alert.alert('Sucesso', 'Lista limpa com sucesso.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível limpar a lista.');
            }
          },
        },
      ]
    );
  };

  // Incrementa ou decrementa a quantidade do item direto no card, recalculando o subtotal
  const handleAlterarQuantidade = async (item: ItemCompra, operacao: 'aumentar' | 'diminuir') => {
    if (!item.id) return;

    let novaQtd = item.quantidade;
    if (operacao === 'aumentar') novaQtd += 1;
    if (operacao === 'diminuir') novaQtd -= 1;

    // Se o usuário diminuir para 0, aciona automaticamente o fluxo de exclusão do item
    if (novaQtd <= 0) {
      handleExcluirItem(item.id);
      return;
    }

    try {
      // Dispara o update no banco passando o novo valor total recalculado
      await compraService.atualizarQuantidadeLocal(item.id, novaQtd, item.precoUnitario);
<<<<<<< HEAD
      await carregarItensDoBancoLocal(); // Atualização dinâmica automática
=======
      carregarItensDoBancoLocal();
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
    } catch (error) {
      console.error("Erro ao atualizar quantidade:", error);
    }
  };

  // REMOVIDO: Função handleLogout e o botão de Sair da interface

  // --- FECHAMENTO E MIGRAÇÃO PARA O HISTÓRICO ---
  const handleFinalizarCompra = async () => {
    const usuario = auth.currentUser;
    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (produtos.length === 0) {
      Alert.alert('Lista vazia', 'Adicione itens antes de finalizar.');
      return;
    }

    try {
      // 1. Cria o registro mestre/principal da compra no histórico (Gera o ID do cabeçalho)
      const historicoId = await compraService.salvarHistoricoCompra({
        userId: usuario.uid,
        dataCompra: new Date().toLocaleDateString('pt-BR'),
        totalCompra: valorTotalCompra,
        quantidadeItens: produtos.length
      });

      // 2. Transfere em lote cada item do carrinho ativo para a tabela detalhada do histórico vinculada
      for (const produto of produtos) {
        await compraService.salvarItemHistorico({
          historicoId,
          nome: produto.nome,
          precoUnitario: produto.precoUnitario,
          quantidade: produto.quantidade,
          totalItem: produto.totalItem
        });
      }

      // 3. Limpa o carrinho ativo local do usuário para uma nova compra futura
      await compraService.limparListaUsuario(usuario.uid);
      carregarItensDoBancoLocal();
      Alert.alert('Compra Finalizada', 'A compra foi enviada para o histórico.');
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Não foi possível finalizar a compra.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
<<<<<<< HEAD
      
      {/* Resumo de Valores */}
=======
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
      <View style={styles.headerDashboard}>
        <Text style={styles.totalLabel}>Total no Carrinho</Text>
        <Text style={styles.totalValue}>R$ {valorTotalCompra.toFixed(2)}</Text>
      </View>

      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ paddingHorizontal: 15, paddingBottom: 20 }}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <Image source={{ uri: item.fotoUrl }} style={styles.cardImage} />

            <View style={styles.cardContent}>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.nome}</Text>
              <Text style={styles.precoUnitarioText}>R$ {item.precoUnitario.toFixed(2)} /un</Text>

              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => handleAlterarQuantidade(item, 'diminuir')}
                >
                  <Text style={styles.qtyButtonText}>-</Text>
                </TouchableOpacity>

                <Text style={styles.cardSub}>{item.quantidade}</Text>

                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => handleAlterarQuantidade(item, 'aumentar')}
                >
                  <Text style={styles.qtyButtonText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.rightCardActions}>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleExcluirItem(item.id)}
              >
                <Text style={styles.deleteButtonText}>✕</Text>
              </TouchableOpacity>
              <Text style={styles.cardTotalItem}>R$ {item.totalItem.toFixed(2)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
<<<<<<< HEAD
          <Text style={styles.emptyText}>Nenhum item na sua lista. Toque no botão abaixo para adicionar!</Text>
=======
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🛒</Text>
            <Text style={styles.emptyText}>Seu carrinho está vazio. Toque em fotografar para começar!</Text>
          </View>
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
        }
      />

      <View style={styles.footerPanel}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.floatingButtonText}> Fotografar Produto</Text>
        </TouchableOpacity>

<<<<<<< HEAD
      {/* MODAL DE CADASTRO */}
=======
        <View style={styles.secondaryActionsRow}>
          <TouchableOpacity style={[styles.inlineButton, styles.outlineButton]} onPress={handleLimparLista}>
            <Text style={styles.outlineButtonText}> Limpar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.inlineButton, styles.outlineButton]} onPress={() => navigation.navigate('History')}>
            <Text style={styles.outlineButtonText}> Histórico</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.finishButton} onPress={handleFinalizarCompra}>
          <Text style={styles.finishButtonText}>✓ Finalizar Compra</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
          <Text style={styles.logoutLinkText}>Sair da Conta</Text>
        </TouchableOpacity>
      </View>

>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>📦 Detalhes do Produto</Text>

              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={styles.modalImagePreview} />
              ) : null}

              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Nome do Produto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Garrafa Modus"
                  placeholderTextColor="#adb5bd"
                  value={nome}
                  onChangeText={setNome}
                  returnKeyType="done"
                />

                <Text style={styles.inputLabel}>Preço Unitário (Gôndola)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 54.90"
                  placeholderTextColor="#adb5bd"
                  value={preco}
                  onChangeText={setPreco}
                  keyboardType="numeric"
                  returnKeyType="done"
                />

                <Text style={styles.inputLabel}>Quantidade de Itens</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2"
                  placeholderTextColor="#adb5bd"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  keyboardType="number-pad"
                  returnKeyType="done"
                />
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#10b981" />
              ) : (
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={handleSalvarItem}>
                    <Text style={styles.btnText}>Adicionar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalBtn, styles.btnCancel]}
                    onPress={() => { setModalVisivel(false); setFotoUrl(''); }}
                  >
                    <Text style={styles.btnText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { flex: 1, backgroundColor: '#f8f9fa', padding: 15 },
  headerDashboard: { backgroundColor: '#007bff', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 15 },
  totalLabel: { color: '#fff', fontSize: 16, opacity: 0.9 },
  totalValue: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginTop: 5 },
  cardItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 10, marginBottom: 10, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1.41, elevation: 2 },
  cardImage: { width: 70, height: 70, borderRadius: 8, backgroundColor: '#eee' },
  cardContent: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 14, color: '#666', marginTop: 2 },
  cardTotalItem: { fontSize: 15, fontWeight: 'bold', color: '#28a745', marginTop: 4 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16, paddingHorizontal: 20 },
  floatingButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  floatingButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', width: '90%', padding: 20, borderRadius: 15, alignItems: 'center' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 15, color: '#333' },
  modalImagePreview: { width: 120, height: 120, borderRadius: 10, marginBottom: 5 },
  formContainer: { width: '100%', marginBottom: 15 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#495057', alignSelf: 'flex-start', marginBottom: 4, marginTop: 10 },
  input: { width: '100%', borderWidth: 1, borderColor: '#ced4da', padding: 12, borderRadius: 8, fontSize: 16, backgroundColor: '#fff', color: '#333' },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 10 },
  modalBtn: { flex: 1, padding: 15, borderRadius: 8, alignItems: 'center', marginHorizontal: 5 },
  btnSave: { backgroundColor: '#28a745' },
  btnCancel: { backgroundColor: '#6c757d' },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 2
  },
  qtyButton: {
    backgroundColor: '#e9ecef',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5
  },
  qtyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#495057'
  },
  precoUnitarioText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 5
  },
  deleteButton: {
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center'
  },
  deleteButtonText: {
    color: '#dc3545',
    fontSize: 20,
    fontWeight: 'bold'
  }
=======
  container: { flex: 1, backgroundColor: '#f4f6f9' },
  headerDashboard: { backgroundColor: '#1e293b', paddingVertical: 25, paddingHorizontal: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20, alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 5 },
  totalLabel: { color: '#94a3b8', fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  totalValue: { color: '#fff', fontSize: 36, fontWeight: '800', marginTop: 4 },
  cardItem: { flexDirection: 'row', backgroundColor: '#fff', padding: 12, borderRadius: 14, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3.84, elevation: 2 },
  cardImage: { width: 65, height: 65, borderRadius: 10, backgroundColor: '#f1f5f9' },
  cardContent: { flex: 1, marginLeft: 14, justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#1e293b' },
  precoUnitarioText: { fontSize: 13, color: '#64748b', marginTop: 2 },
  rightCardActions: { alignItems: 'flex-end', justifyContent: 'space-between', height: 65 },
  cardTotalItem: { fontSize: 15, fontWeight: '700', color: '#0f766e' },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 40 },
  emptyIcon: { fontSize: 40, marginBottom: 10 },
  emptyText: { textAlign: 'center', color: '#94a3b8', fontSize: 15, lineHeight: 22 },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyButton: { backgroundColor: '#f1f5f9', width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  qtyButtonText: { fontSize: 14, fontWeight: '700', color: '#475569' },
  cardSub: { fontSize: 14, fontWeight: '600', color: '#1e293b', paddingHorizontal: 12 },
  deleteButton: { padding: 4 },
  deleteButtonText: { color: '#ef4444', fontSize: 16, fontWeight: '600' },
  footerPanel: { backgroundColor: '#fff', padding: 16, borderTopWidth: 1, borderColor: '#e2e8f0' },
  floatingButton: { backgroundColor: '#10b981', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 10 },
  floatingButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  secondaryActionsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  inlineButton: { flex: 1, padding: 12, borderRadius: 10, alignItems: 'center', marginHorizontal: 4 },
  outlineButton: { borderWidth: 1, borderColor: '#cbd5e1', backgroundColor: '#fff' },
  outlineButtonText: { color: '#475569', fontSize: 14, fontWeight: '600' },
  finishButton: { backgroundColor: '#3b82f6', padding: 14, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  finishButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  logoutLink: { alignItems: 'center', paddingVertical: 4 },
  logoutLinkText: { color: '#94a3b8', fontWeight: '600', fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.6)', justifyContent: 'center', alignItems: 'center' },
  modalContainer: { backgroundColor: '#fff', width: '88%', padding: 22, borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 10 },
  modalTitle: { fontSize: 20, fontWeight: '700', marginBottom: 15, color: '#1e293b' },
  modalImagePreview: { width: 140, height: 140, borderRadius: 12, marginBottom: 10, alignSelf: 'center' },
  formContainer: { width: '100%' },
  inputLabel: { fontSize: 13, fontWeight: '600', color: '#475569', marginBottom: 5, marginTop: 8 },
  input: { width: '100%', borderWidth: 1, borderColor: '#e2e8f0', padding: 12, borderRadius: 10, fontSize: 15, backgroundColor: '#f8fafc', color: '#1e293b' },
  modalActions: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginTop: 15 },
  modalBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  btnSave: { backgroundColor: '#10b981' },
  btnCancel: { backgroundColor: '#64748b' },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
});