import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // --- LÓGICA DE AUTENTICAÇÃO ---
  const handleLogin = () => {
<<<<<<< HEAD
    const emailLimpo = email.trim();
    const senhaLimpa = senha.trim();

    // Validação 1: Campos vazios
    if (!emailLimpo || !senhaLimpa) {
      Alert.alert('Erro de Validação', 'Por favor, preencha todos os campos.');
      return;
    }

    // Validação 2: Formato do e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpo)) {
      Alert.alert('E-mail Inválido', 'Por favor, insira um formato de e-mail válido (Ex: nome@email.com).');
      return;
    }

    // Validação 3: Tamanho da senha
    if (senhaLimpa.length < 6) {
      Alert.alert('Senha Fraca', 'A senha deve conter pelo menos 6 caracteres.');
      return;
    }

    // Sucesso - vai para a lista
    Alert.alert('Sucesso', 'Login realizado com sucesso!', [
      {
        text: 'Acessar Aplicativo',
        onPress: () => {
          navigation.replace('List');
        }
      }
    ]);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.card}>
          <Text style={styles.title}>🛒 ComprasApp</Text>
          <Text style={styles.subtitle}>Faça login para gerenciar sua lista</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu e-mail"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              value={senha}
              onChangeText={setSenha}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>
=======
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
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
<<<<<<< HEAD
  container: { 
    flex: 1, 
    backgroundColor: '#F3F4F6', // Fundo cinza bem claro e moderno
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  card: { 
    width: '85%', 
    backgroundColor: '#FFFFFF', 
    padding: 30, 
    borderRadius: 24, // Cantos bem arredondados
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.05, 
    shadowRadius: 15, 
    elevation: 5 // Sombra suave que dá efeito de flutuar
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#111827', 
    textAlign: 'center', 
    marginBottom: 8, 
    letterSpacing: -0.5 
  },
  subtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    textAlign: 'center', 
    marginBottom: 30 
  },
  inputGroup: { 
    width: '100%', 
    marginBottom: 20 
  },
  label: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: '#374151', 
    marginBottom: 8, 
    marginLeft: 4 
  },
  input: { 
    width: '100%', 
    borderWidth: 0, // Sem borda pesada
    backgroundColor: '#F9FAFB', // Fundo do input levemente destacado
    padding: 16, 
    borderRadius: 16, 
    fontSize: 16, 
    color: '#1F2937' 
  },
  button: { 
    backgroundColor: '#10B981', // Verde Esmeralda vibrante
    padding: 18, 
    borderRadius: 16, 
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: '#10B981', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    elevation: 4 
  },
  buttonText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: 'bold', 
    letterSpacing: 0.5 
  }
=======
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  logo: { width: 180, height: 180, marginBottom: 30 },
  input: { width: '100%', height: 50, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, paddingHorizontal: 15, marginBottom: 15 },
  button: { backgroundColor: '#007bff', width: '100%', height: 50, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  linkText: { marginTop: 20, color: '#007bff', fontSize: 16 },
>>>>>>> 75b3296f34bbd9a594054ae73e85703037f8d8b9
});