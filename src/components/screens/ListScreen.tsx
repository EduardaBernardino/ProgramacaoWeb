import React, { useState, useEffect } from 'react';
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
  Keyboard
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { compraService, ItemCompra } from '../../services/compraService';

export default function ListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Estados do componente adaptados para o SQLite (id numérico)
  const [produtos, setProdutos] = useState<ItemCompra[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // Função centralizada para buscar a lista filtrada do usuário logado
  const carregarItensDoBancoLocal = () => {
    const usuarioLogado = auth.currentUser;
    if (usuarioLogado) {
      // Requisito: Cada usuário visualiza apenas a sua própria lista
      const dados = compraService.listarItensPorUsuario(usuarioLogado.uid);
      setProdutos(dados);
    } else {
      Alert.alert('Sessão Expirada', 'Por favor, realize o login novamente.');
      navigation.navigate('Login');
    }
  };

  // 1. Escuta a resposta da câmera ao retornar para a tela
  useEffect(() => {
    if (route.params?.fotoUrl) {
      setFotoUrl(route.params.fotoUrl);
      setModalVisivel(true);
    }
  }, [route.params?.fotoUrl]);

  // 2. Carrega a lista local em tempo de montagem da tela
  useEffect(() => {
    carregarItensDoBancoLocal();
  }, []);

  // 3. Soma total baseada no array do banco local
  const valorTotalCompra = produtos.reduce((acc, item) => acc + item.totalItem, 0);

  // 4. Salva o item de forma síncrona/otimista no SQLite local
  const handleSalvarItem = async () => {
    const usuarioLogado = auth.currentUser;

    if (!usuarioLogado) {
      Alert.alert('Erro', 'Usuário não autenticado.');
      return;
    }

    if (!nome || !preco || !quantidade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    try {
      setLoading(true);

      const precoLimpo = preco.trim().replace(',', '.');
      const valorUnitario = parseFloat(precoLimpo);
      const qtd = parseInt(quantidade.trim(), 10);

      if (isNaN(valorUnitario) || isNaN(qtd) || valorUnitario <= 0 || qtd <= 0) {
        Alert.alert('Erro', 'Verifique os valores inseridos no preço e quantidade.');
        setLoading(false);
        return;
      }

      // Requisito: Valor total do item calculado automaticamente (valor × quantidade)
      const totalItemCalculado = valorUnitario * qtd;

      // Salvamento Local no SQLite
      await compraService.salvarItemLocal({
        userId: usuarioLogado.uid, // Garante o isolamento por ID
        nome: nome.trim(),
        precoUnitario: valorUnitario,
        quantidade: qtd,
        fotoUrl: fotoUrl || 'https://via.placeholder.com/150',
        totalItem: totalItemCalculado,
      });

      // Reseta inputs e fecha modal
      setNome('');
      setPreco('');
      setQuantidade('');
      setFotoUrl('');
      setModalVisivel(false);

      // Recarrega instantaneamente a lista na tela
      carregarItensDoBancoLocal();
      Alert.alert('Sucesso', 'Item adicionado à sua lista local!');

    } catch (error) {
      console.error("Erro ao salvar no SQLite: ", error);
      Alert.alert('Erro Local', 'Não foi possível gravar os dados no banco interno do aparelho.');
    } finally {
      setLoading(false);
    }
  };

  // Opcional: Função de logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao deslogar.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho de Resumo de Valores */}
      <View style={styles.headerDashboard}>
        <Text style={styles.totalLabel}>Total da Compra:</Text>
        <Text style={styles.totalValue}>R$ {valorTotalCompra.toFixed(2)}</Text>
      </View>

      {/* Lista de Compras do Usuário (SQLite) */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => (
          <View style={styles.cardItem}>
            <Image source={{ uri: item.fotoUrl }} style={styles.cardImage} />
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{item.nome}</Text>
              <Text style={styles.cardSub}>
                {item.quantidade}x R$ {item.precoUnitario.toFixed(2)}
              </Text>
              <Text style={styles.cardTotalItem}>Total: R$ {item.totalItem.toFixed(2)}</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum item na sua lista. Toque no botão abaixo para escanear!</Text>
        }
      />

      {/* Botão Inferior Principal para Chamar a Câmera */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('Camera')}
      >
        <Text style={styles.floatingButtonText}>📷 Fotografar Produto</Text>
      </TouchableOpacity>

      {/* Botão de Logout */}
      <TouchableOpacity style={styles.logoutLink} onPress={handleLogout}>
        <Text style={styles.logoutLinkText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* MODAL DE CADASTRO DO ITEM */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>📦 Detalhes do Produto</Text>

              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={styles.modalImagePreview} />
              ) : null}

              <View style={styles.formContainer}>
                {/* Nome do Produto */}
                <Text style={styles.inputLabel}>Nome do Produto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Garrafa Modus"
                  placeholderTextColor="#999"
                  value={nome}
                  onChangeText={setNome}
                />

                {/* Preço Unitário */}
                <Text style={styles.inputLabel}>Preço Unitário (Gôndola)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 54.90"
                  placeholderTextColor="#999"
                  value={preco}
                  onChangeText={setPreco}
                  keyboardType="numeric"
                />

                {/* Quantidade */}
                <Text style={styles.inputLabel}>Quantidade de Itens</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 2"
                  placeholderTextColor="#999"
                  value={quantidade}
                  onChangeText={setQuantidade}
                  keyboardType="number-pad"
                />
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#28a745" />
              ) : (
                <View style={styles.modalActions}>
                  <TouchableOpacity style={[styles.modalBtn, styles.btnSave]} onPress={handleSalvarItem}>
                    <Text style={styles.btnText}>Adicionar à Lista</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
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
  logoutLink: { alignItems: 'center', paddingVertical: 5 },
  logoutLinkText: { color: '#dc3545', fontWeight: 'bold', fontSize: 15 },
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
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});