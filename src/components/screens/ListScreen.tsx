import React, { useEffect, useState, useRef, useCallback } from 'react';
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
  Keyboard,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { auth } from '../../services/firebase';
import { compraService, ItemCompra } from '../../services/compraService';
import { signOut } from 'firebase/auth';

async function salvarImagemPersistente(uriTemporaria: string): Promise<string> {
  if (Platform.OS === 'web') return uriTemporaria;
  try {
    const FileSystem = require('expo-file-system/legacy');
    const nomeArquivo = `produto_${Date.now()}.jpg`;
    const destino = `${FileSystem.documentDirectory}${nomeArquivo}`;
    await FileSystem.copyAsync({ from: uriTemporaria, to: destino });
    return destino;
  } catch {
    return uriTemporaria;
  }
}

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
  const salvandoRef = useRef(false);

  const getUsuario = () => auth.currentUser;

  const carregarItens = async () => {
    const usuario = getUsuario();
    if (usuario) {
      const dados = await compraService.listarItensPorUsuario(usuario.uid);
      setProdutos(dados);
    }
  };

  useEffect(() => {
    if (route.params?.fotoUrl) {
      setFotoUrl(route.params.fotoUrl);
      setModalVisivel(true);
      navigation.setParams({ fotoUrl: undefined });
    }
  }, [route.params?.fotoUrl]);

  // useFocusEffect garante que a lista recarregue sempre que a tela ganhar foco
  // (inclusive ao voltar do Checkout após finalizar a compra)
  useFocusEffect(
      useCallback(() => {
        carregarItens();
      }, [])
  );

  const valorTotalCompra = produtos.reduce((acc, item) => acc + item.totalItem, 0);

  const handleSalvarItem = async () => {
    if (salvandoRef.current) return;
    salvandoRef.current = true;

    Keyboard.dismiss();
    const usuario = getUsuario();

    if (!usuario) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      salvandoRef.current = false;
      return;
    }

    if (!nome.trim() || !preco.trim() || !quantidade.trim() || !fotoUrl) {
      Alert.alert('Erro', 'Preencha todos os campos e capture a foto do produto.');
      salvandoRef.current = false;
      return;
    }

    try {
      setLoading(true);
      const precoLimpo = preco.replace('R$', '').replace(',', '.').trim();
      const valorUnitario = parseFloat(precoLimpo);
      const qtd = parseInt(quantidade.trim(), 10);

      if (isNaN(valorUnitario) || isNaN(qtd) || valorUnitario <= 0 || qtd <= 0) {
        Alert.alert('Erro', 'Verifique os valores inseridos no preço e quantidade.');
        salvandoRef.current = false;
        setLoading(false);
        return;
      }

      const fotoUrlPersistente = await salvarImagemPersistente(fotoUrl);

      await compraService.salvarItemLocal({
        userId: usuario.uid,
        nome: nome.trim(),
        fotoUrl: fotoUrlPersistente,
        precoUnitario: valorUnitario,
        quantidade: qtd,
        totalItem: valorUnitario * qtd,
      });

      setNome('');
      setPreco('');
      setQuantidade('');
      setFotoUrl('');
      setModalVisivel(false);
      await carregarItens();
      Alert.alert('Sucesso', 'Item adicionado à sua lista!');
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível gravar os dados.');
    } finally {
      setLoading(false);
      salvandoRef.current = false;
    }
  };

  const handleExcluirItem = (id: number | undefined) => {
    if (!id) return;
    const usuario = getUsuario();
    if (!usuario) return;

    const executarExclusao = async () => {
      try {
        await compraService.excluirItemLocal(id, usuario.uid);
        await carregarItens();
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível excluir o item.');
      }
    };

    if (Platform.OS === 'web') {
      // Na web Alert.alert não suporta botões customizados — usa confirm nativo
      if (window.confirm('Tem certeza que deseja tirar este produto da lista?')) {
        executarExclusao();
      }
    } else {
      Alert.alert(
          'Remover Item',
          'Tem certeza que deseja tirar este produto da lista?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Sim, remover', style: 'destructive', onPress: executarExclusao },
          ]
      );
    }
  };

  const handleLimparLista = () => {
    const usuario = getUsuario();
    if (!usuario) return;

    const executarLimpeza = async () => {
      try {
        await compraService.limparListaUsuario(usuario.uid);
        await carregarItens();
        Alert.alert('Sucesso', 'Lista limpa com sucesso.');
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível limpar a lista.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Deseja remover todos os itens da lista?')) {
        executarLimpeza();
      }
    } else {
      Alert.alert(
          'Limpar Lista',
          'Deseja remover todos os itens da lista?',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Limpar', style: 'destructive', onPress: executarLimpeza },
          ]
      );
    }
  };

  // CORRIGIDO: passa userId para atualizarQuantidadeLocal
  const handleAlterarQuantidade = async (item: ItemCompra, operacao: 'aumentar' | 'diminuir') => {
    if (!item.id) return;
    const usuario = getUsuario();
    if (!usuario) return;

    let novaQtd = item.quantidade;
    if (operacao === 'aumentar') novaQtd += 1;
    if (operacao === 'diminuir') novaQtd -= 1;

    if (novaQtd <= 0) {
      handleExcluirItem(item.id);
      return;
    }

    try {
      await compraService.atualizarQuantidadeLocal(item.id, novaQtd, item.precoUnitario, usuario.uid); // CORRIGIDO
      await carregarItens();
    } catch (error) {
      console.error('Erro ao atualizar quantidade:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível sair da conta.');
    }
  };

  const handleFinalizarCompra = () => {
    if (produtos.length === 0) {
      Alert.alert('Lista vazia', 'Adicione itens antes de finalizar.');
      return;
    }
    navigation.navigate('Checkout', { itens: produtos });
  };

  return (
      <SafeAreaView style={styles.container}>
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
                      <TouchableOpacity style={styles.qtyButton} onPress={() => handleAlterarQuantidade(item, 'diminuir')}>
                        <Text style={styles.qtyButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.cardSub}>{item.quantidade}</Text>
                      <TouchableOpacity style={styles.qtyButton} onPress={() => handleAlterarQuantidade(item, 'aumentar')}>
                        <Text style={styles.qtyButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <View style={styles.rightCardActions}>
                    <TouchableOpacity style={styles.deleteButton} onPress={() => handleExcluirItem(item.id)}>
                      <Text style={styles.deleteButtonText}>✕</Text>
                    </TouchableOpacity>
                    <Text style={styles.cardTotalItem}>R$ {item.totalItem.toFixed(2)}</Text>
                  </View>
                </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>🛒</Text>
                <Text style={styles.emptyText}>Seu carrinho está vazio. Toque em fotografar para começar!</Text>
              </View>
            }
        />

        <View style={styles.footerPanel}>
          <TouchableOpacity style={styles.floatingButton} onPress={() => navigation.navigate('Camera')}>
            <Text style={styles.floatingButtonText}>📷 Fotografar Produto</Text>
          </TouchableOpacity>
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity style={[styles.inlineButton, styles.outlineButton]} onPress={handleLimparLista}>
              <Text style={styles.outlineButtonText}>🗑 Limpar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.inlineButton, styles.outlineButton]} onPress={() => navigation.navigate('History')}>
              <Text style={styles.outlineButtonText}>📜 Histórico</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinalizarCompra}>
            <Text style={styles.finishButtonText}>🧾 Conferir e Finalizar Compra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
            <Text style={styles.logoutLinkText}>Sair da Conta</Text>
          </TouchableOpacity>
        </View>

        <Modal visible={modalVisivel} animationType="slide" transparent>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>📦 Detalhes do Produto</Text>
              {fotoUrl ? <Image source={{ uri: fotoUrl }} style={styles.modalImagePreview} /> : null}
              <View style={styles.formContainer}>
                <Text style={styles.inputLabel}>Nome do Produto</Text>
                <TextInput style={styles.input} placeholder="Ex: Garrafa Modus" placeholderTextColor="#adb5bd" value={nome} onChangeText={setNome} returnKeyType="done" />
                <Text style={styles.inputLabel}>Preço Unitário (Gôndola)</Text>
                <TextInput style={styles.input} placeholder="Ex: 54.90" placeholderTextColor="#adb5bd" value={preco} onChangeText={setPreco} keyboardType="numeric" returnKeyType="done" />
                <Text style={styles.inputLabel}>Quantidade de Itens</Text>
                <TextInput style={styles.input} placeholder="Ex: 2" placeholderTextColor="#adb5bd" value={quantidade} onChangeText={setQuantidade} keyboardType="number-pad" returnKeyType="done" />
              </View>
              {loading ? (
                  <ActivityIndicator size="large" color="#10b981" />
              ) : (
                  <View style={styles.modalActions}>
                    <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={handleSalvarItem}>
                      <Text style={styles.btnText}>Adicionar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.modalBtn, styles.btnCancel]} onPress={() => { setModalVisivel(false); setFotoUrl(''); }}>
                      <Text style={styles.btnText}>Cancelar</Text>
                    </TouchableOpacity>
                  </View>
              )}
            </View>
          </View>
        </Modal>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
});
