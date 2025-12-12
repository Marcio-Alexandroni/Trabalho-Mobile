import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { getFavorites, removeFavorite } from '../storage/favoritesStorage';

export default function FavoritosScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);

  async function loadFavorites() {
    const favs = await getFavorites();
    setFavorites(favs);
  }

  useEffect(() => {
    // carregar sempre que a tela ganhar foco
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  async function handleRemove(url) {
    await removeFavorite(url);
    loadFavorites();
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() =>
          Alert.alert(
            'Remover',
            `Remover ${item.name} dos favoritos?`,
            [
              { text: 'Cancelar', style: 'cancel' },
              {
                text: 'Remover',
                style: 'destructive',
                onPress: () => handleRemove(item.url),
              },
            ],
          )
        }
      >
        {/* Requisito: listar os sites das universidades favoritas */}
        <Text style={styles.site}>{item.url}</Text>
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        keyExtractor={(item, index) => item.url + index}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhuma universidade favorita.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  listItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  site: {
    fontSize: 14,
    color: '#0066cc',
  },
  name: {
    fontSize: 12,
    color: '#444',
  },
  emptyText: {
    marginTop: 16,
    textAlign: 'center',
    color: '#666',
  },
});
