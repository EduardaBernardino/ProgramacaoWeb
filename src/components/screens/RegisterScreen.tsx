import React, { useState, useRef } from 'react';
// Importação dos componentes estruturais e visuais nativos do React Native
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
// Importação da função do Firebase Auth para criar um novo usuário
import { createUserWithEmailAndPassword } from 'firebase/auth';
// Importação da instância do Firebase configurada no seu projeto
import { auth } from '../../services/firebase';

// Definição da tela de Registro. Recebe a propriedade 'navigation' para navegar entre telas
export default function RegisterScreen({ navigation }: any) {
    // Estados para armazenar os valores digitados nos campos de texto
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // useRef funciona como uma variável que mantém seu valor entre renderizações.
    // Usado aqui como uma trava ("Guard") para evitar que o usuário clique duas vezes seguidas
    // e dispare duas requisições de cadastro ao mesmo tempo.
    const registrandoRef = useRef(false);

    // Função assíncrona que lida com o processo de cadastro
    const handleRegister = async () => {
        // Se já houver um cadastro em andamento, interrompe a execução da função
        if (registrandoRef.current) return;

        // Ativa a trava (bloqueia novos cliques)
        registrandoRef.current = true;

        try {
            // 1. Validação de campos vazios
            if (!email || !password || !confirmPassword) {
                Alert.alert('Erro', 'Preencha todos os campos.');
                return; // Interrompe a função se faltar algo
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

            // Envia os dados para o Firebase para criar a conta
            await createUserWithEmailAndPassword(auth, email, password);

            // O Firebase loga o usuário automaticamente logo após a criação da conta.
            // O listener 'onAuthStateChanged' (geralmente nas suas rotas) vai perceber isso e mudar de tela.
            console.log('Usuário cadastrado e logado automaticamente pelo Firebase.');

        } catch (error: any) {
            console.error(error);
            // Tratamento de erros específicos baseados nos códigos de erro retornados pelo Firebase
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
            // O bloco 'finally' sempre roda, independente de ter dado certo ou errado.
            // Desativa a trava, permitindo que o botão seja clicado novamente no futuro.
            registrandoRef.current = false;
        }
    };

    return (
        // Container principal da tela
        <View style={styles.container}>
            {/* Exibição da logo do aplicativo */}
            <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
            />

            {/* Campo de entrada para o E-mail */}
            <TextInput
                style={styles.input}
                placeholder="E-mail"
                value={email}
                onChangeText={setEmail} // Atualiza o estado 'email' conforme o usuário digita
                keyboardType="email-address" // Abre o teclado otimizado para e-mails (com '@' visível)
                autoCapitalize="none" // Evita que o teclado coloque a primeira letra em maiúscula
            />

            {/* Campo de entrada para a Senha */}
            <TextInput
                style={styles.input}
                placeholder="Senha (mínimo 6 caracteres)"
                value={password}
                onChangeText={setPassword} // Atualiza o estado 'password'
                secureTextEntry // Esconde o texto digitado (caracteres de senha)
            />

            {/* Campo para confirmar a Senha */}
            <TextInput
                style={styles.input}
                placeholder="Confirme a Senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword} // Atualiza o estado 'confirmPassword'
                secureTextEntry // Esconde o texto digitado
            />

            {/* Botão customizado para disparar o cadastro */}
            <TouchableOpacity style={styles.button} onPress={handleRegister}>
                <Text style={styles.buttonText}>Cadastrar</Text>
            </TouchableOpacity>

            {/* Link para voltar à tela anterior (geralmente a tela de Login) */}
            <TouchableOpacity onPress={() => navigation.goBack()}>
                <Text style={styles.linkText}>Já tem uma conta? Voltar para o Login</Text>
            </TouchableOpacity>
        </View>
    );
}

// Estilização dos componentes usando StyleSheet (semelhante ao CSS)
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
        alignItems: 'center'
    },
    logo: {
        width: 140,
        height: 140,
        marginBottom: 20
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 12,
        borderRadius: 8,
        marginBottom: 15,
        fontSize: 16
    },
    button: {
        backgroundColor: '#28a745',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
        width: '100%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold'
    },
    linkText: {
        color: '#007bff',
        marginTop: 20,
        textAlign: 'center',
        fontSize: 16
    },
});