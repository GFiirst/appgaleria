import React from 'react';
import { FlatList, Image, TouchableOpacity,  StyleSheet,} from 'react-native';

const MyFilesList = ({ files, onImagePress }) => {
  return (
    <FlatList
      style = {styles.item}
      data={files}
      keyExtractor={(item) => item.url}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => onImagePress(item.url)}>
          <Image source={{ uri: item.url }} style={{ width: 110, height: 100 }} />
        </TouchableOpacity>
      )}
      numColumns={3}
      contentContainerStyle={{ gap: 2 }}
      columnWrapperStyle={{ gap: 2 }}
    
    />
    
  );
};

export default MyFilesList;


const styles = StyleSheet.create({

    item: {
      marginVertical: 30,
      marginHorizontal: 30,
    },
  });