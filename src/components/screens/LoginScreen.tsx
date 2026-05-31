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

  const handleLogin = () => {
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

          <TouchableOpacity style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Entrar</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
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
});