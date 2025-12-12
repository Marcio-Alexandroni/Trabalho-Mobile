import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@universidades_favoritas';

export async function getFavorites() {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.warn('Erro ao ler favoritos', e);
    return [];
  }
}

export async function addFavorite(fav) {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = json ? JSON.parse(json) : [];

    // evita duplicado pelo site
    const exists = arr.some(item => item.url === fav.url);
    if (!exists) {
      arr.push(fav);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    }
  } catch (e) {
    console.warn('Erro ao salvar favorito', e);
  }
}

export async function removeFavorite(url) {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    const arr = json ? JSON.parse(json) : [];
    const filtered = arr.filter(item => item.url !== url);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Erro ao remover favorito', e);
  }
}
