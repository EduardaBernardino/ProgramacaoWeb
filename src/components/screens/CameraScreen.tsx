import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

export default function CameraScreen({ navigation }: any) {
  // Estado para controlar o loading (indicador de carregamento) na tela
  const [loading, setLoading] = useState(false);
  // Estado para armazenar o caminho (URI) da imagem processada
  const [imageUri, setImageUri] = useState<string | null>(null);

  // useEffect que roda uma vez assim que a tela é montada
  // Dispara a abertura da câmera automaticamente para o usuário
  useEffect(() => {
    tirarFoto();
  }, []);

  // Função assíncrona responsável por lidar com o fluxo da câmera
  const tirarFoto = async () => {
    // Solicita a permissão de uso da câmera para o usuário
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    // Se o usuário recusar a permissão, exibe um alerta e volta para a tela anterior
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'Precisamos de acesso à câmera para fotografar o produto.'
      );
      navigation.goBack();
      return; // Interrompe a execução da função
    }

    // Abre a câmera nativa do aparelho para o usuário tirar a foto
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Define que o foco são apenas imagens
      quality: 1,            // Captura na qualidade máxima original
    });

    // Se o usuário fechar a câmera sem tirar a foto, cancela o fluxo e volta de tela
    if (result.canceled) {
      navigation.goBack();
      return;
    }

    // Recupera o caminho (URI) temporário da foto original recém-tirada
    const uriOriginal = result.assets[0].uri;

    try {
      // Ativa a tela de loading para o usuário ver que a imagem está processando
      setLoading(true);

      // Manipula a imagem para otimizá-la antes de enviar ou salvar
      const imagemTratada = await ImageManipulator.manipulateAsync(
          uriOriginal,
          [{ resize: { width: 500 } }],
          {
            compress: 0.6,
            format: ImageManipulator.SaveFormat.JPEG,
          }
      );

      // Salva o caminho da nova imagem otimizada no estado para visualização
      setImageUri(imagemTratada.uri);

      // Desativa o indicador de carregamento
      setLoading(false);

      // Exibe um alerta de sucesso com um botão de ação
      Alert.alert(
        'Sucesso!',
        'Imagem capturada e processada com sucesso.',
        [
          {
            text: 'Continuar Cadastro',
            onPress: () => {
              // Navega para a tela 'List', passando a URI da foto tratada como parâmetro
              navigation.navigate('List', {
                fotoUrl: imagemTratada.uri,
              });
            },
          },
        ]
      );
    } catch (error) {
      // Trata possíveis erros no processo de manipulação do arquivo
      console.error(error);
      Alert.alert(
        'Erro',
        'Falha ao processar a imagem.'
      );
      setLoading(false); // Garante que o loading feche mesmo em caso de erro
    }
  };

  return (
    <View style={styles.container}>
      {/* Se houver uma imagem processada no estado, exibe ela preenchendo a tela */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {/* Se estiver em estado de loading, exibe o overlay escuro com o spinner */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Otimizando e tratando imagem...</Text>
        </View>
      )}

      {/* Se NÃO estiver carregando, exibe o botão para o usuário tentar tirar outra foto */}
      {!loading && (
        <TouchableOpacity style={styles.button} onPress={tirarFoto}>
          <Text style={styles.buttonText}>Tirar Outra Foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Estilizações da tela utilizando StyleSheet
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center'
  },
  preview: {
    width: '100%',
    height: '100%',
    position: 'absolute' // Faz a imagem ficar de fundo
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)', // Fundo preto com 80% de opacidade
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%'
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16
  },
  button: {
    position: 'absolute',
    bottom: 40, // Posiciona o botão fixo na parte inferior da tela
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    width: '80%',
    alignItems: 'center',
    zIndex: 10 // Garante que o botão fique acima da imagem de preview
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold'
  }
});