import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { addFavorite } from '../storage/favoritesStorage';

export default function PrincipalScreen({ navigation }) {
  const [country, setCountry] = useState('');
  const [name, setName] = useState('');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleSearch() {
    const params = [];
    if (country.trim() !== '') {
      params.push(`country=${encodeURIComponent(country.trim())}`);
    }
    if (name.trim() !== '') {
      params.push(`name=${encodeURIComponent(name.trim())}`);
    }

    if (params.length === 0) {
      Alert.alert('Atenção', 'Informe pelo menos país ou universidade.');
      return;
    }

    const url = `http://universities.hipolabs.com/search?${params.join('&')}`;

    try {
      setLoading(true);
      const response = await fetch(url);
      const data = await response.json();
      setUniversities(data);
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível buscar as universidades.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectUniversity(item) {
    if (!item.web_pages || item.web_pages.length === 0) {
      Alert.alert('Sem site', 'Essa universidade não tem site cadastrado.');
      return;
    }

    const url = item.web_pages[0];

    // persiste no "banco de dados"
    await addFavorite({
      name: item.name,
      url,
    });

    // vai para a tela de Favoritos
    navigation.navigate('Favoritos');
  }

  function renderItem({ item }) {
    return (
      <TouchableOpacity
        style={styles.listItem}
        onPress={() => handleSelectUniversity(item)}
      >
        {/* Exibir o name na lista (requisito) */}
        <Text style={styles.universityName}>{item.name}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nome do País</Text>
      <TextInput
        style={styles.input}
        value={country}
        onChangeText={setCountry}
        placeholder="Ex: Brazil"
      />

      <Text style={styles.label}>Nome da Universidade</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Ex: Univ"
      />

      <View style={styles.buttonsRow}>
        <Button title="PESQUISAR" onPress={handleSearch} disabled={loading} />
        <Button
          title="FAVORITOS"
          onPress={() => navigation.navigate('Favoritos')}
        />
      </View>

      <FlatList
        data={universities}
        keyExtractor={(item, index) => item.name + index}
        renderItem={renderItem}
        style={styles.list}
        ListEmptyComponent={
          !loading && (
            <Text style={styles.emptyText}>
              Nenhuma universidade carregada.
            </Text>
          )
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
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 4,
  },
  buttonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  list: {
    marginTop: 8,
  },
  listItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  universityName: {
    fontSize: 16,},
  emptyText: {
    textAlign: 'center',},
});