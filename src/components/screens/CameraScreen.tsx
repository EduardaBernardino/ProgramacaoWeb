import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
  ScrollView,
} from 'react-native';
// Biblioteca do Expo para abrir a câmera ou galeria nativa do dispositivo
import * as ImagePicker from 'expo-image-picker';
// Biblioteca do Expo para editar imagens (redimensionar, rotacionar, comprimir)
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation }: any) {
  // Estados para controlar o loading, o caminho da imagem e a liberação do botão confirmar
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imagemPronta, setImagemPronta] = useState(false);

  // Ciclo de vida: Dispara o gatilho da câmera ou seletor de arquivos assim que a tela abre
  useEffect(() => {
    if (Platform.OS === 'web') {
      abrirArquivoWeb(); // Fluxo para navegadores
    } else {
      tirarFoto(); // Fluxo nativo para iOS e Android
    }
  }, []);

  // Envia a URI da foto tratada de volta para a tela de listagem por meio dos parâmetros de navegação
  const confirmarImagem = () => {
    if (!imageUri) return;
    navigation.navigate('List', { fotoUrl: imageUri });
  };

  // ─── FLUXO WEB (Navegadores) ───────────────────────────────────────────────

  // Cria dinamicamente um elemento <input type="file"> invisível para disparar o seletor de arquivos do navegador
  const abrirArquivoWeb = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*'; // Filtra apenas para arquivos de imagem
    input.capture = 'environment'; // Em dispositivos móveis rodando a Web, tenta forçar o uso da câmera traseira

    // Listener disparado assim que o usuário seleciona uma imagem
    input.onchange = async (e: any) => {
      const file: File = e.target.files[0];
      if (!file) {
        navigation.goBack(); // Se o usuário cancelou a escolha, volta de tela
        return;
      }

      try {
        setLoading(true);
        setImagemPronta(false);

        // 1. Transforma o arquivo binário em uma String Base64 legível pela tag <Image>
        const uriBase64 = await lerArquivoComoDataUrl(file);
        // 2. Redimensiona a imagem usando a API do Canvas do HTML5 para poupar memória e armazenamento
        const uriRedimensionada = await redimensionarImagemWeb(uriBase64, 500);

        setImageUri(uriRedimensionada);
        setImagemPronta(true);
        setLoading(false);
      } catch (error) {
        console.error(error);
        Alert.alert('Erro', 'Falha ao processar a imagem.');
        setLoading(false);
      }
    };

    // Caso o usuário feche a janela de seleção sem escolher nada
    input.oncancel = () => navigation.goBack();
    input.click(); // Executa o clique virtual para abrir a janela do sistema operacional
  };

  // Utilitário Web: Lê o arquivo e retorna uma Promise contendo a string no formato DataURL (base64)
  const lerArquivoComoDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Utilitário Web: Desenha a imagem dentro de um elemento Canvas invisível para redimensionar sua largura/altura
  const redimensionarImagemWeb = (dataUrl: string, larguraAlvo: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        // Mantém a proporção original calculando a nova altura com base na largura alvo
        const proporcao = larguraAlvo / img.width;
        const altura = img.height * proporcao;

        const canvas = document.createElement('canvas');
        canvas.width = larguraAlvo;
        canvas.height = altura;

        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas não disponível')); return; }

        ctx.drawImage(img, 0, 0, larguraAlvo, altura);
        // Exporta o resultado do Canvas de volta em string jpeg com compressão de 60%
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // ─── FLUXO MOBILE (iOS e Android Nativo) ──────────────────────────────────

  // Solicita permissões de hardware e inicializa a câmera do smartphone
  const tirarFoto = async () => {
    // Requisita a permissão de uso da câmera ao sistema operacional
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para fotografar o produto.');
      navigation.goBack();
      return;
    }

    // Abre a interface nativa da câmera
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'], // Restringe a captura apenas para fotos (ignora vídeos)
      quality: 1,            // Tira a foto na resolução máxima disponível
    });

    // Se o usuário clicou no botão voltar da câmera sem tirar a foto
    if (result.canceled) {
      navigation.goBack();
      return;
    }

    // Recupera o caminho do arquivo temporário gerado no armazenamento do celular
    const uriOriginal = result.assets[0].uri;

    try {
      setLoading(true);
      setImagemPronta(false);

      // Otimização de imagem móvel: Altera a largura para 500px proporcionalmente
      // e aplica compressão de 60% convertendo para JPEG para reduzir o peso do arquivo final.
      const imagemTratada = await ImageManipulator.manipulateAsync(
          uriOriginal,
          [{ resize: { width: 500 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImageUri(imagemTratada.uri);
      setLoading(false);

      // Caixa de diálogo de sucesso oferecendo ação imediata de retorno à listagem
      Alert.alert(
          'Sucesso!',
          'Imagem capturada e processada com sucesso.',
          [{ text: 'Continuar Cadastro', onPress: () => navigation.navigate('List', { fotoUrl: imagemTratada.uri }) }]
      );
    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao processar a imagem.');
      setLoading(false);
    }
  };

  // ─── RENDERIZAÇÃO DA TELA (Condicionais de Plataforma) ─────────────────────
  if (Platform.OS === 'web') {
    return (
        <View style={styles.containerWeb}>
          <View style={styles.previewBoxWeb}>
            {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="#007bff" />
                  <Text style={styles.loadingText}>Otimizando e tratando imagem...</Text>
                </View>
            )}

            {imageUri && !loading && (
                <Image
                    source={{ uri: imageUri }}
                    style={styles.previewWeb}
                    resizeMode="contain"
                />
            )}

            {!imageUri && !loading && (
                <Text style={styles.placeholderText}>Nenhuma imagem selecionada</Text>
            )}
          </View>

          <View style={styles.botoesContainer}>
            {imagemPronta && (
                <TouchableOpacity style={styles.buttonConfirmar} onPress={confirmarImagem}>
                  <Text style={styles.buttonText}>✅ Continuar Cadastro</Text>
                </TouchableOpacity>
            )}
            {!loading && (
                <TouchableOpacity style={styles.button} onPress={abrirArquivoWeb}>
                  <Text style={styles.buttonText}>📁 Selecionar Outra Imagem</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
    );
  }

  return (
      <View style={styles.container}>
        {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

        {loading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#007bff" />
              <Text style={styles.loadingText}>Otimizando e tratando imagem...</Text>
            </View>
        )}

        {!loading && (
            <View style={styles.botoesContainer}>
              <TouchableOpacity style={styles.button} onPress={tirarFoto}>
                <Text style={styles.buttonText}>📷 Tirar Outra Foto</Text>
              </TouchableOpacity>
            </View>
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  preview: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  containerWeb: {
    flex: 1,
    backgroundColor: '#f4f6f9',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewBoxWeb: {
    width: '100%',
    maxWidth: 500,
    height: 380,
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  previewWeb: {
    width: 500,
    height: 380,
  },
  placeholderText: {
    color: '#666',
    fontSize: 15,
  },
  loadingOverlay: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  loadingText: {
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
    fontSize: 16,
  },
  botoesContainer: {
    width: '100%',
    maxWidth: 500,
    gap: 10,
  },
  buttonConfirmar: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});