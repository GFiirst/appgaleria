import { StatusBar } from 'expo-status-bar';
import {  
  StyleSheet,
  View,
  SafeAreaView, 
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
  Text,
  Button
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome, Ionicons, AntDesign} from '@expo/vector-icons';
import { db, storage } from '../firebaseConfig';
import { useEffect, useState } from 'react';
import MyFilesList from '../components/Mylist';
import { ref,uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { addDoc, collection, onSnapshot, getDocs, where, deleteDoc} from 'firebase/firestore';
import { Uploading } from "../components/Uploading";
import { UploadingAndroid } from "../components/UploadingAndroid";
import Modal from 'react-native-modal';
import { auth } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

export default function Home({ navigation }) {

  const [user, setUser] = useState(null);
  const [image,setImage]= useState("");
  const [progress, setProgress] = useState(0);
  const [files, setFiles] = useState([]);
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImageUri, setSelectedImageUri] = useState('');


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      
      if (user) {
        const unsubscribeFiles = onSnapshot(
          collection(db, "files"),
          (snapshot) => {
            setFiles([]);
            snapshot.forEach((doc) => {
              const fileData = doc.data();
              if (fileData.userId === user.uid) {
                setFiles((prevFiles) => [...prevFiles, fileData]);
              }
            });
          }
        );
  
        return () => unsubscribeFiles();
      }
    });

    return () => unsubscribe();
  }, []);
  
  const handleImagePress = (uri) => {
    setSelectedImageUri(uri);
    setModalVisible(true);
  };



  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "files"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const fileData = change.doc.data();

        if (fileData.userId === user?.uid) {
          setFiles((prevFiles) => [...prevFiles, fileData]);
        }
        }
      });
    });
    return () => unsubscribe();
  }, []);


  const handleDeleteImage = async (uri) => {
    try {
      // Encontrar o documento no Firebase com a URL da imagem
      const querySnapshot = await getDocs(collection(db, 'files'), where('url', '==', uri));
  
      if (!querySnapshot.empty) {
        // Obter a referência do documento
        const docRef = querySnapshot.docs[0].ref;
  
        // Excluir o documento
        await deleteDoc(docRef);
  
        // Atualizar a lista de arquivos (opcional, dependendo da sua lógica)
        setFiles((prevFiles) => prevFiles.filter((file) => file.url !== uri));
  
        // Ocultar o modal
        setModalVisible(false);
      }
    } catch (error) {
      console.error('Erro ao excluir a imagem:', error);
    }
  };



  async function uploadImage(uri, fileType) {
    try {
      if (!user) {
        console.error('Usuário não autenticado. Faça login para enviar imagens.');
        return;
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const storageRef = ref(storage, `Images/${user.uid}/${new Date().getTime()}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setProgress(progress.toFixed());
        },
        (error) => {
          console.error('Erro no upload da imagem:', error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            console.log("File available at", downloadURL);
            await saveRecord(fileType, downloadURL, new Date().toISOString());
            setImage("");
          });
        }
      );
    } catch (error) {
      console.error('Erro no upload da imagem:', error);
    }
  }


/**
 * 
 */
async function takePhoto() {
    let result = await ImagePicker.launchCameraAsync({
            MediaTypeOptions : ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [3, 4],
            quality: 1,
          });
    if (!result.canceled){
     
        setImage(result.assets[0].uri);
      
        await uploadImage(result.assets[0].uri, "all");
    
      
    }
  };

  async function pickImage() {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
     
      await uploadImage(result.assets[0].uri, "image");
    }
  }



  async function saveRecord(fileType, url, createdAt) {
    try {
      const docRef = await addDoc(collection(db, "files"), {
        fileType,
        url,
        createdAt,
        userId: user.uid,
      });
      console.log("document saved correctly", docRef.id);
    } catch (e) {
      console.log(e);
    }
  }

  

  //tela principal



  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>

        
        {user ? (
          <>
            <MyFilesList files={files} onImagePress={handleImagePress} />
          
            {image && (
              Platform.OS === 'ios' ? (
                <Uploading image={image} progress={progress} />
              ) : (
                <UploadingAndroid image={image} progress={progress} />
              )
            )}
          </>
        ) : (
          <View style={styles.loginMessage}>
            <Text>Faça login para visualizar as imagens</Text>
            <Button title="Login" onPress={() => navigation.navigate('Login')} />
          </View>
        )}
        <StatusBar style="auto" />
    
        
      

        <Modal isVisible={isModalVisible} transparent={true} onRequestClose={() => setModalVisible(false)}>
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
              <Image source={{ uri: selectedImageUri }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
              <TouchableOpacity onPress={() => handleDeleteImage(selectedImageUri)} style={{ position: 'absolute', top: 10, right: 10 }}>
                <AntDesign name="delete" size={30} color="red" />
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
</Modal>


          
        <TouchableOpacity style={styles.foto} onPress={takePhoto}>
        <FontAwesome name="camera" size = {23} color="#FFF"/>
        </TouchableOpacity>
        <TouchableOpacity
        onPress={pickImage}
        style={{
          position: "absolute",
          bottom: 90,
          right: 30,
          width: 44,
          height: 44,
          backgroundColor: "black",
          justifyContent: "center",
          alignItems: "center",
          borderRadius: 25,
        }}
      >
        <Ionicons name="image" size={24} color="white" />
      </TouchableOpacity>

      
        <StatusBar style='auto'/>
        </View>
    </SafeAreaView>
    
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  foto:{
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1C1C1C',
    position: 'absolute',
    right:160,
    bottom:20,
    marginBottom: 1,
    borderRadius:30,
    height: 60,
    width: 60,
  }
});