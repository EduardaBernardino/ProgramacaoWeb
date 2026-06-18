import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
// Hook para gerenciar a navegação global do app
import { useNavigation } from '@react-navigation/native';
// Função do Firebase Auth para autenticar um usuário existente com e-mail e senha
import { signInWithEmailAndPassword } from 'firebase/auth';
// Instância do Firebase configurada no projeto
import { auth } from '../../services/firebase';

export default function LoginScreen() {
  // Inicialização do objeto de navegação de forma tipada
  const navigation = useNavigation<any>();

  // Estados para capturar as credenciais informadas pelo usuário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Função assíncrona responsável pelo processo de login
  const handleLogin = async () => {
    // Validação básica utilizando .trim() para remover espaços em branco acidentais antes ou depois do texto
    if (!email.trim() || !senha.trim()) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return; // Bloqueia a execução se os campos estiverem vazios
    }

    try {
      // Faz a requisição de login enviando a instância do auth, o e-mail (sem espaços) e a senha
      await signInWithEmailAndPassword(auth, email.trim(), senha);
      // Se der certo, o Firebase Auth atualiza o estado da sessão globalmente.
      // O redirecionamento acontece no listener principal de rotas (onAuthStateChanged).
    } catch (error: any) {
      console.log(error.code); // Exibe o código do erro no terminal para debug

      // Tratamento centralizado para erros de credenciais (segurança: não detalha se o erro foi especificamente no e-mail ou na senha)
      if (
          error.code === 'auth/invalid-credential' || // Código padrão do Firebase v10+ para erro de login
          error.code === 'auth/wrong-password' ||      // Mantido por compatibilidade com versões anteriores
          error.code === 'auth/user-not-found'        // Mantido por compatibilidade com versões anteriores
      ) {
        Alert.alert('Erro', 'E-mail ou senha inválidos.');
      } else if (error.code === 'auth/invalid-email') {
        // Erro disparado se a string não possuir o formato padrão de um e-mail (ex: faltar o '@')
        Alert.alert('Erro', 'Formato de e-mail inválido.');
      } else {
        // Fallback genérico para erros de rede, timeout ou problemas nos servidores do Firebase
        Alert.alert('Erro', 'Não foi possível conectar ao servidor.');
      }
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
            placeholder="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Entrar</Text>
        </TouchableOpacity>

        {/* Aciona a navegação para a tela de Registro configurada no seu Navigator */}
        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Criar Conta</Text>
        </TouchableOpacity>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: 30,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007bff',
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  linkText: {
    marginTop: 20,
    color: '#007bff',
    fontSize: 16,
  },
});