import React, { useState, useRef } from 'react';
import {
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
    Image,
    Platform,
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Guard para evitar duplo clique no botão Cadastrar
    const registrandoRef = useRef(false);

    const handleRegister = async () => {
        if (registrandoRef.current) return;
        registrandoRef.current = true;

        try {
            // 1. Validação de campos vazios
            if (!email || !password || !confirmPassword) {
                Alert.alert('Erro', 'Preencha todos os campos.');
                return;
            }

            // 2. Validação de igualdade de senhas
            if (password !== confirmPassword) {
                Alert.alert('Erro', 'As senhas não coincidem.');
                return;
            }

            // 3. Tamanho mínimo exigido pelo Firebase Auth
            if (password.length < 6) {
                Alert.alert('Erro', 'A senha deve ter pelo menos 6 caracteres.');
                return;
            }

            await createUserWithEmailAndPassword(auth, email, password);
            // Firebase loga automaticamente após criação —
            // o onAuthStateChanged em Routes detecta e troca para a stack autenticada
            console.log('Usuário cadastrado e logado automaticamente pelo Firebase.');

        } catch (error: any) {
            console.error(error);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Erro no cadastro', 'Este e-mail já está cadastrado. Tente fazer login.');
            } else if (error.code === 'auth/invalid-email') {
                Alert.alert('Erro no cadastro', 'Formato de e-mail inválido.');
            } else if (error.code === 'auth/weak-password') {
                Alert.alert('Erro no cadastro', 'A senha é muito fraca.');
            } else {
                Alert.alert('Erro no cadastro', 'Não foi possível criar a conta. Tente novamente.');
            }
        } finally {
            registrandoRef.current = false;
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

            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Já tem uma conta? Voltar para o Login</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff', alignItems: 'center' },
    logo: { width: 140, height: 140, marginBottom: 20 },
    input: { width: '100%', borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15, fontSize: 16 },
    button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10, width: '100%' },
    buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
    linkText: { color: '#007bff', marginTop: 20, textAlign: 'center', fontSize: 16 },
});
