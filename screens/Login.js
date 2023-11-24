import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword } from 'firebase/auth';   



const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      if (!email || !password) {
        console.error('E-mail e senha são obrigatórios.');
        return;
      }
  
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Navegar para a tela principal após o login
      const user = userCredential.user;
      navigation.navigate('Home');
    } catch (error) {
      console.error('Erro no login:', error.code, error.message);
    }
  };
  

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="E-mail"
        onChangeText={(text) => setEmail(text)}
        value={email}
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        onChangeText={(text) => setPassword(text)}
        value={password}
      />
        <TouchableOpacity style={styles.botao} onPress={handleLogin}>

            <Text>Login</Text>

        </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: 300,
    borderRadius: 10,
  },
  botao:{
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    padding:6,
    borderRadius: 10,
  },
});

export default Login;
