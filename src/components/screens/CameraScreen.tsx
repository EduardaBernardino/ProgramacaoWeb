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
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imagemPronta, setImagemPronta] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      abrirArquivoWeb();
    } else {
      tirarFoto();
    }
  }, []);

  const confirmarImagem = () => {
    if (!imageUri) return;
    navigation.navigate('List', { fotoUrl: imageUri });
  };

  // ─── FLUXO WEB ────────────────────────────────────────────────────────────
  const abrirArquivoWeb = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';

    input.onchange = async (e: any) => {
      const file: File = e.target.files[0];
      if (!file) {
        navigation.goBack();
        return;
      }

      try {
        setLoading(true);
        setImagemPronta(false);

        const uriBase64 = await lerArquivoComoDataUrl(file);
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

    input.oncancel = () => navigation.goBack();
    input.click();
  };

  const lerArquivoComoDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const redimensionarImagemWeb = (dataUrl: string, larguraAlvo: number): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const proporcao = larguraAlvo / img.width;
        const altura = img.height * proporcao;
        const canvas = document.createElement('canvas');
        canvas.width = larguraAlvo;
        canvas.height = altura;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas não disponível')); return; }
        ctx.drawImage(img, 0, 0, larguraAlvo, altura);
        resolve(canvas.toDataURL('image/jpeg', 0.6));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  // ─── FLUXO MOBILE ─────────────────────────────────────────────────────────
  const tirarFoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para fotografar o produto.');
      navigation.goBack();
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 1,
    });

    if (result.canceled) {
      navigation.goBack();
      return;
    }

    const uriOriginal = result.assets[0].uri;

    try {
      setLoading(true);
      setImagemPronta(false);

      const imagemTratada = await ImageManipulator.manipulateAsync(
          uriOriginal,
          [{ resize: { width: 500 } }],
          { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImageUri(imagemTratada.uri);
      setLoading(false);

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

  // ─── WEB: layout com preview redimensionado ───────────────────────────────
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

            {/* Imagem com tamanho controlado — não ocupa a tela toda */}
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

  // ─── MOBILE: layout original com imagem em fullscreen ─────────────────────
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
  // ── Mobile ──
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

  // ── Web ──
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

  // ── Compartilhados ──
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
