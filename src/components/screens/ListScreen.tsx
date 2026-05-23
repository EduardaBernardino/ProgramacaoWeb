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
import { collection, addDoc, onSnapshot, query, deleteDoc, doc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../services/firebase';

interface Produto {
  id: string;
  nome: string;
  precoUnitario: number;
  quantidade: number;
  fotoUrl: string;
  totalItem: number;
}

export default function ListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  // Estados do componente
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [modalVisivel, setModalVisivel] = useState(false);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [quantidade, setQuantidade] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  // 1. Escuta os parâmetros vindos da CameraScreen
  useEffect(() => {
    if (route.params?.fotoUrl) {
      setFotoUrl(route.params.fotoUrl);
      setModalVisivel(true); // Abre o formulário automaticamente ao voltar com a foto
    }
  }, [route.params?.fotoUrl]);

  // 2. Busca os itens do Firestore em Tempo Real
  useEffect(() => {
    const q = query(collection(db, 'compras'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const lista: Produto[] = [];
      querySnapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() } as Produto);
      });
      setProdutos(lista);
    });

    return () => unsubscribe(); // Limpa o listener ao sair
  }, []);

  // 3. Calcula o Valor Total de toda a compra
  const valorTotalCompra = produtos.reduce((acc, item) => acc + item.totalItem, 0);

  // 4. Salva o item no Firestore (Vinculando os dados e a URL da imagem)

const handleSalvarItem = () => { // Removi o 'async' daqui
  if (!nome || !preco || !quantidade) {
    Alert.alert('Erro', 'Por favor, preencha todos os campos.');
    return;
  }

  try {
    // 1. Trata os números normalmente
    const precoLimpo = preco.trim().replace(',', '.');
    const valorUnitario = parseFloat(precoLimpo);
    const qtd = parseInt(quantidade.trim(), 10);

    if (isNaN(valorUnitario) || isNaN(qtd)) {
      Alert.alert('Erro', 'Dados numéricos inválidos.');
      return;
    }

    const totalItem = valorUnitario * qtd;

    // 2. Chamamos o addDoc SEM o 'await'. Ele vai disparar em segundo plano!
    addDoc(collection(db, 'compras'), {
      nome: nome.trim(),
      precoUnitario: valorUnitario,
      quantidade: qtd,
      fotoUrl: fotoUrl || 'https://via.placeholder.com/150',
      totalItem: totalItem,
    }).catch((err) => {
      // Se der erro lá na frente, ele avisa no console do computador, sem travar sua tela
      console.log("Erro em segundo plano no Firestore:", err);
    });

    // 3. FLUXO INSTANTÂNEO: Fecha tudo na hora sem dar chance para o loop rodar!
    setNome('');
    setPreco('');
    setQuantidade('');
    setFotoUrl('');
    setModalVisivel(false);

    // Alerta rápido de sucesso
    Alert.alert('Sucesso', 'Item adicionado à lista!');

  } catch (error: any) {
    console.error("Erro no clique:", error);
    Alert.alert('Erro', 'Não foi possível processar o item.');
  }
};
  const handleRemoverItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'compras', id));
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível remover o item.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Cabeçalho de Resumo de Valores */}
      <View style={styles.headerDashboard}>
        <Text style={styles.totalLabel}>Total da Compra:</Text>
        <Text style={styles.totalValue}>R$ {valorTotalCompra.toFixed(2)}</Text>
      </View>

      {/* Lista em Tempo Real */}
      <FlatList
        data={produtos}
        keyExtractor={(item) => item.id}
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
            <TouchableOpacity style={styles.deleteButton} onPress={() => handleRemoverItem(item.id)}>
              <Text style={styles.deleteButtonText}>❌</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum item na lista. Comece fotografando um produto!</Text>
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
      <TouchableOpacity style={styles.logoutLink} onPress={() => signOut(auth)}>
        <Text style={styles.logoutLinkText}>Sair da Conta</Text>
      </TouchableOpacity>

      {/* MODAL DE CADASTRO DO ITEM */}
      <Modal visible={modalVisivel} animationType="slide" transparent>
        {/* Captura o clique fora das caixas de texto para recolher o teclado automaticamente */}
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>📦 Detalhes do Produto</Text>

              {fotoUrl ? (
                <Image source={{ uri: fotoUrl }} style={styles.modalImagePreview} />
              ) : null}

              {/* Container para alinhar os campos do formulário */}
              <View style={styles.formContainer}>

                {/* Campo 1: Nome */}
                <Text style={styles.inputLabel}>Nome do Produto</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Arroz Integral 1kg, Leite UHT"
                  placeholderTextColor="#999"
                  value={nome}
                  onChangeText={setNome}
                />

                {/* Campo 2: Preço */}
                <Text style={styles.inputLabel}>Preço Unitário (Gôndola)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: 5.49"
                  placeholderTextColor="#999"
                  value={preco}
                  onChangeText={setPreco}
                  keyboardType="numeric"
                />

                {/* Campo 3: Quantidade */}
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
  deleteButton: { padding: 10 },
  deleteButtonText: { fontSize: 18 },
  emptyText: { textAlign: 'center', color: '#888', marginTop: 40, fontSize: 16, paddingHorizontal: 20 },
  floatingButton: { backgroundColor: '#28a745', padding: 16, borderRadius: 30, alignItems: 'center', justifyContent: 'center', marginVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  floatingButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  logoutLink: { alignItems: 'center', paddingVertical: 5 },
  logoutLinkText: { color: '#dc3545', fontWeight: 'bold', fontSize: 15 },

  // Estilos do Modal e Formulário
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