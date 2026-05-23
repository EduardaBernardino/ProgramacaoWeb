import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image } from 'react-native'; // Adicionado Image aqui
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');


  const handleRegister = async () => {
  if (!email || !password || !confirmPassword) {
    Alert.alert('Erro', 'Preencha todos os campos.');
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert('Erro', 'As senhas não coincidem.');
    return;
  }

  if (password.length < 6) {
    Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
    return;
  }

  try {
    // 1. Cria a conta no Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    // 2. Desloga imediatamente para não disparar a mudança automática de rota
    await signOut(auth);

    // 3. Exibe o alerta de sucesso e manda o usuário de volta para a tela de Login
    Alert.alert('Sucesso!', 'Conta criada com sucesso.', [
      { text: 'Voltar à tela de login', onPress: () => navigation.navigate('Login') }
    ]);

  } catch (error: any) {
    console.error(error);
    Alert.alert('Erro no cadastro', 'Verifique o e-mail ou tente outra senha.');
  }
};

  return (
    <View style={styles.container}>
      {/* 1. INSERÇÃO DA LOGO MENOR ADAPTADA PARA O CADASTRO */}
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

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.linkText}>Já tem uma conta? Voltar para o Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff', alignItems: 'center' }, // Adicionado alignItems para alinhar a logo
  input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 }, // Adicionado width 100%
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, width: '100%' }, // Adicionado width 100%
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { color: '#007bff', marginTop: 20, textAlign: 'center', fontSize: 16 },
  logo: {
    width: 140,  // Diminuído de 180 para 140 para equilibrar os 3 inputs na tela móvel
    height: 140,
    marginBottom: 20,
  }
});