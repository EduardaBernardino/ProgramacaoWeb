import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native';
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // --- LÓGICA DE CADASTRO ---
  const handleRegister = async () => {
    // 1. Validação de consistência básica (Campos vazios)
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    // 2. Validação local de igualdade de senhas para evitar requisição inútil à rede
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    // 3. Validação de tamanho mínimo exigido nativamente pela política padrão do Firebase Auth
    if (password.length < 6) {
      Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      // Dispara a criação da conta. Ao retornar com sucesso, o usuário é logado automaticamente.
      // O listener global da aplicação captura a mudança de estado e reconstrói o fluxo de rotas.
      await createUserWithEmailAndPassword(auth, email, password);

      // Log para controle de debug; evita-se disparar Alerts de sucesso que concorram
      // visualmente com a desmontagem imediata da tela gerenciada pelo navegador.
      console.log('Usuário cadastrado e logado automaticamente pelo Firebase.');

    } catch (error: any) {
      console.error(error);
      // Fallback genérico para cobrir e-mails duplicados, formatos inválidos ou quedas de conexão
      Alert.alert('Erro no cadastro', 'Verifique o e-mail ou tente outra senha.');
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../../assets/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <TextInput
        style={styles.input}
        placeholder="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        style={styles.input}
        placeholder="Senha (mínimo 6 caracteres)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TextInput
        style={styles.input}
        placeholder="Confirme a Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>

      {/* Retorna para a tela de login utilizando a pilha existente, preservando o histórico */}
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Já tem uma conta? Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, width: '100%' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', marginTop: 20, textAlign: 'center', fontSize: 16 },
  logo: { width: 140, height: 140, marginBottom: 20 }
});