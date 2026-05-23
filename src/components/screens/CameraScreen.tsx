import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

// MUDANÇA AQUI: Importando o FileSystem da rota legado exigida pelo Expo v54
import * as FileSystem from 'expo-file-system/legacy';


export default function CameraScreen({ navigation }: any) {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Tirar a foto assim que a tela abrir
  useEffect(() => {
    tirarFoto();
  }, []);

  const tirarFoto = async () => {
    // 1. Solicita permissão da câmera
    const { status } = await ImagePicker.requestCameraPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para fotografar o produto.');
      navigation.goBack();
      return;
    }

    // 2. Abre a câmera para captura (CRITÉRIO: Captura da imagem via câmera - 0,2pt)
    // Altere apenas essa propriedade dentro do launchCameraAsync:
    const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'], // Nova sintaxe do Expo para evitar o Warning
    quality: 1,
});


    if (result.canceled) {
      navigation.goBack();
      return;
    }

    const uriOriginal = result.assets[0].uri;
    setImageUri(uriOriginal);

    // 3. Tratamento Obrigatório (CRITÉRIO: Resize e Compressão - 0,2pt)
    try {
      setLoading(true);

      const imagemTratada = await ImageManipulator.manipulateAsync(
        uriOriginal,
        [{ resize: { width: 500 } }],
        { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG }
      );

      // 4. Processamento e conversão para Base64
      await converterESalvar(imagemTratada.uri);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro', 'Falha ao processar a imagem.');
      setLoading(false);
    }
  };

  const converterESalvar = async (uriPath: string) => {
    try {
      // Passamos a string direta 'base64' no objeto de opções, removendo o erro do TypeScript
      const base64Image = await FileSystem.readAsStringAsync(uriPath, {
        encoding: 'base64',
      });

      const fotoStringFinal = `data:image/jpeg;base64,${base64Image}`;

      setLoading(false);

      // Exibe sucesso e retorna a string de texto da foto para a tela List por parâmetro
      Alert.alert('Sucesso!', 'Imagem capturada e processada com sucesso.', [
        {
          text: 'Continuar Cadastro',
          onPress: () => {
            navigation.navigate('List', { fotoUrl: fotoStringFinal });
          }
        }
      ]);

    } catch (error) {
      console.error(error);
      Alert.alert('Erro no processamento', 'Não foi possível ler o arquivo da imagem.');
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri && <Image source={{ uri: imageUri }} style={styles.preview} />}

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Tratando e convertendo imagem em texto...</Text>
        </View>
      )}

      {!loading && (
        <TouchableOpacity style={styles.button} onPress={tirarFoto}>
          <Text style={styles.buttonText}>Tirar Outra Foto</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  preview: { width: '100%', height: '100%', position: 'absolute' },
  loadingOverlay: { backgroundColor: 'rgba(0,0,0,0.8)', padding: 20, borderRadius: 10, alignItems: 'center', width: '80%' },
  loadingText: { color: '#fff', marginTop: 15, textAlign: 'center', fontSize: 16 },
  button: { position: 'absolute', bottom: 40, backgroundColor: '#007bff', padding: 15, borderRadius: 8, width: '80%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});