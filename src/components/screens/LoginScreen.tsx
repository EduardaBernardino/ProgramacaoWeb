import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // --- LÓGICA DE AUTENTICAÇÃO ---
  const handleLogin = () => {
    // Validação inicial simples para evitar requisições desnecessárias ao Firebase
    if (email.trim() === '' || senha === '') {
      Alert.alert('Atenção', 'Por favor, preencha todos os campos.');
      return;
    }

    // Dispara a tentativa de login usando a SDK do Firebase
    signInWithEmailAndPassword(auth, email.trim(), senha)
      .then(() => {
        // Sucesso! Não é necessário navegar manualmente aqui.
        // O listener global 'onAuthStateChanged' na raiz do app detectará a sessão e mudará as rotas.
      })
      .catch(error => {
        console.log(error.code); // Exibe o código do erro no terminal (essencial para debug)

        // --- TRATAMENTO REFINADO DE ERROS DO FIREBASE ---
        // Agrupa erros de credenciais por segurança (evita mapear se o e-mail existe ou não no banco)
        if (
          error.code === 'auth/invalid-credential' ||
          error.code === 'auth/wrong-password' ||
          error.code === 'auth/user-not-found'
        ) {
          Alert.alert('Erro', 'E-mail ou senha inválidos.');
        } else if (error.code === 'auth/invalid-email') {
          Alert.alert('Erro', 'Formato de e-mail inválido.');
        } else {
          // Captura erros de rede, timeout ou indisponibilidade dos serviços do Firebase
          Alert.alert('Erro', 'Não foi possível conectar ao servidor. Tente novamente.');
        }
      });
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
        autoCapitalize="none" // Desativa a primeira letra maiúscula automática para e-mails
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={senha}
        onChangeText={setSenha}
        secureTextEntry // Mascara os caracteres da senha digitada
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text style={styles.linkText}>Não tem uma conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 180, height: 180, marginBottom: 30 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  button: { backgroundColor: '#007bff', width: '100%', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { marginTop: 20, color: '#007bff', fontSize: 16 },
});