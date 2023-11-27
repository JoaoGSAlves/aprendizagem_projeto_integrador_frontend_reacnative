import { View, Text, FlatList, StyleSheet, Platform, Alert, TouchableWithoutFeedback, Keyboard, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { Avatar, Card, IconButton, AnimatedFAB, TextInput } from 'react-native-paper';
import { NativeBaseProvider, Modal, Input, Toast, Divider, Center, Button, Box, Stack, Heading } from 'native-base';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing'
import * as MediaLibrary from 'expo-media-library';
import { Recurso } from '../../../models/Recurso';
import RecursoService from '../../../core/services/RecursoService';
import uuid from 'uuid-random';
import { useAuth } from '../../../contexts/AuthContext';



export default function listaRecursos() {

  const { usuarioId } = useAuth().authState.userData;
  const { listaRecursos, originalData, setListaRecursos, getListaRecursoPorUsuarioId, deleteRecurso, saveRecurso, updateRecurso } = RecursoService()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedRecurso, setEditedRecurso] = useState<Recurso | null>(null);


  const [showModal, setShowModal] = useState(false);
  const [showDesc, setShowDesc] = useState(true);

  const [fileResponse, setFileResponse] = useState([]);
  const [recurso, setRecurso] = useState<Recurso>()
  const [nomeArquivo, setNomeArquivo] = useState<string>('');
  const [desc, setText] = useState('');

  const id = uuid();


  const saveFileInDevice = async (arquivo: string, nomeArquivo: string) => {
    const fileExtension = nomeArquivo.split(".")[1]

    const filePath = FileSystem.documentDirectory + nomeArquivo

    //FileSystem.writeAsStringAsync(filePath, arquivo, { encoding: 'base64' });
    // FileSystem.downloadAsync(fileUri, filePath)
    // .then(({ uri }) => {
    //   console.log('Finished downloading to ', uri);
    // })
    // .catch(error => {
    //   console.error(error);
    // });
    if (Platform.OS === 'android') {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync()
      if (permissions.granted) {
        await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, nomeArquivo, fileExtension)
          .then(async (filePath) => {
            await FileSystem.writeAsStringAsync(filePath, arquivo, { encoding: 'base64' });
          })
          .catch(e => console.log(e))
      };
    }
    else {
      shareAsync(filePath)
    }


    // await MediaLibrary.saveToLibraryAsync(filePath); SALVA NA BIBLIOTECA, teoricamente só funciona com imagens, videos, pdf
  }


  type RenderRecursoProps = {
    item: Recurso
  };

  const RenderRecurso = ({ item }: RenderRecursoProps) => {
    return (
      <View>
        <Card.Title
          title={item.nomeArquivo}
          subtitle={item.descricao}
          left={(props) => (
            <TouchableOpacity onPress={() => saveFileInDevice(item.arquivo, item.nomeArquivo)}>
              <Avatar.Icon {...props} style={styles.button} icon="content-save" />
            </TouchableOpacity>
          )}
          right={(props) => (
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconButton
                icon="pencil"
                onPress={() => {
                  setEditedRecurso(item); // Define o recurso a ser editado
                  setIsEditModalOpen(true); // Abre o modal de edição
                }}
              />
              <IconButton
                {...props}
                icon="close"
                onPress={() =>
                  Alert.alert(
                    "",
                    "Tem certeza que deseja apagar o arquivo?",
                    [
                      {
                        text: 'Sim',
                        onPress: () => {
                          deleteRecurso(item.id)
                            .catch((error) => {
                              Toast.show({
                                title: "Erro ao apagar arquivo!",
                                placement: "top",
                                backgroundColor: "amber.500",
                              });
                              console.log(error);
                            })
                            .then(() => {
                              getListaRecursoPorUsuarioId(usuarioId),
                                Toast.show({
                                  title: "Arquivo apagado com sucesso!",
                                  placement: "top",
                                  backgroundColor: "green.500",
                                });
                            });
                        },
                        style: 'destructive',
                      },
                      {
                        text: 'Não',
                        onPress: () => {
                          // Lógica a ser executada ao pressionar o Botão 2
                          return null;
                        },
                        style: 'cancel',
                      },
                    ],
                  )
                }
              />
            </View>
          )}
        />
        <Text style={styles.additionalText}>Data de criação: {item.dataCadastro}</Text>
        <Divider />
      </View>

    )
  }



  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});
    if (result.type == "success") {
      let data = result.uri;

      Platform.OS == 'android' ? data = data.replace('file://', '') : data;
      console.log(desc)
      let base64 = await FileSystem.readAsStringAsync(data, { encoding: FileSystem.EncodingType.Base64 });
      // utilize o valor de base64 aqui
      const Recurso = {
        id: 7,
        descricao: desc,
        nomeArquivo: result.name,
        arquivo: base64,
        dataCadastro: new Date().toISOString(),
        status: 1,
        usuarioId: usuarioId,
      };
      setRecurso(Recurso)
      console.log(recurso)

      setNomeArquivo(result.name)
    }

  };
  const EditModal = ({ isOpen, onClose, editedRecurso, setEditedRecurso }) => {
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Alterar nome do arquivo</Modal.Header>
          <Modal.Body>
            <Input
              value={editedRecurso?.descricao || ''}
              onChangeText={(text) =>
                setEditedRecurso({ ...editedRecurso, descricao: text })
              }
            />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button
                variant="ghost"
                colorScheme="blueGray"
                onPress={() => {
                  onClose();
                  setEditedRecurso(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                colorScheme="blue"
                onPress={() => {
                  updateRecurso(editedRecurso);
                  onClose(); // Fecha o modal de edição após a edição
                  setEditedRecurso(null); // Limpa o recurso editado
                }}
              >
                Salvar
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    );
  };

  const ModalUpload = () => {

    return <Center>
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <Modal.Content maxWidth="400px">
          <Modal.Header>Upload de Recursos</Modal.Header>
          <Modal.Body>
            <UploadBox />
          </Modal.Body>
          <Modal.Footer>
            <Button.Group space={2}>
              <Button variant="ghost" colorScheme="blueGray" onPress={() => {
                setShowModal(false);
              }}>
                Cancel
              </Button>
              <Button colorScheme='blue' onPress={
                () => {
                  saveRecurso(recurso).catch((error) => {
                    Toast.show({
                      title: "Erro ao salvar arquivo!",
                      placement: "top",
                      backgroundColor: "amber.500",
                    });
                    console.log(error);
                  }).
                    then(() => {
                      getListaRecursoPorUsuarioId(usuarioId),
                        Toast.show({
                          title: "Arquivo salvo com sucesso!",
                          placement: "top",
                          backgroundColor: "green.500",
                        });
                      setShowModal(false);
                    });
                }}>
                Save
              </Button>
            </Button.Group>
          </Modal.Footer>
        </Modal.Content>
      </Modal>
    </Center>;
  };

  const UploadBox = () => {
    return <Box alignItems="center">
      <Box w="250" maxW="250" rounded="lg" overflow="hidden" borderColor="coolGray.200" borderWidth="1" _dark={{
        borderColor: "coolGray.600",
        backgroundColor: "gray.700"
      }} _web={{
        borderWidth: 0
      }} _light={{
        backgroundColor: "gray.50"
      }}>
        <Stack p="4" space={3}>
          <Stack space={2}>
            <Heading size="md" ml="-1">
              <Button colorScheme='blue' onPress={() => { pickDocument(), setShowDesc(false) }}>
                Escolher arquivo
              </Button>
            </Heading>
            <Text>Nome: {nomeArquivo}</Text>
            <Input size="lg" placeholder="Descrição" isDisabled={showDesc} value={desc} onChangeText={text => setText(text)} />
          </Stack>
          {fileResponse.map((file, index) => (
            <Text
              key={index.toString()}
              numberOfLines={1}
              ellipsizeMode={'middle'}>
              {file?.uri}
            </Text>
          ))}
        </Stack>
      </Box>
    </Box>;
  };


  function search(s) {
    let arr = JSON.parse(JSON.stringify(originalData));
    setListaRecursos(arr.filter((item) =>
      item.nomeArquivo.toUpperCase().includes(s.toUpperCase()) || item.descricao.toUpperCase().includes(s.toUpperCase())))
  }

  // const searchFilterFunction = (text) => {
  //   if (text) {
  //     const newData = listaRecursos.filter((item) => {
  //       const itemData = item.nomeArquivo
  //         ? item.nomeArquivo.toUpperCase()
  //         : ''.toUpperCase();
  //       const textData = text.toUpperCase();
  //       return itemData.indexOf(textData) > -1;
  //     });
  //   } else {
  //     setListaRecursos(listaRecursos)
  //   }
  // };


  return (
    <NativeBaseProvider>
      {usuarioId &&
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View>
            <Heading fontFamily={'Poppins'} fontSize="20" p="2" marginLeft="4">
              Arquivos
            </Heading>
            <TextInput
              placeholder='Pesquisar'
              style={styles.input}
              placeholderTextColor={'#999'}
              onChangeText={(s) => { search(s) }}
            />
            <TouchableOpacity style={styles.buttonUpload} onPress={() => setShowModal(true)}>
              <View style={styles.buttonTextContainer}>
                <Text style={styles.buttonText}>Upload</Text>
              </View>
            </TouchableOpacity>
            <FlatList
              data={listaRecursos}
              renderItem={RenderRecurso}
              key={id}
              style={styles.listaRecursos}
            />
            {/* <AnimatedFAB
              icon={'plus'}
              extended={false}
              label={'Label'}
              onPress={() => setShowModal(true)}
              visible={true}
              animateFrom={'right'}
              iconMode={'static'}
              color='#F2994A'
              style={[styles.fabStyle, styles.button]}
            /> */}
            <ModalUpload />
            <EditModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              editedRecurso={editedRecurso}
              setEditedRecurso={setEditedRecurso}
            />
          </View>
        </TouchableWithoutFeedback>}
    </NativeBaseProvider>

  )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
  fabStyle: {
    right: 16,
    top: 460,
    position: 'absolute',
  },
  button: {
    backgroundColor: '#2563ea',
  },
  listaRecursos: {
    marginTop: 10,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: '#2563ea',
    color: '#2563ea',
  },
  buttonUpload: {
    height: 40,
    marginVertical: 5,
    marginHorizontal: 12,
    borderWidth: 1,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#2563ea',
    borderColor: '#2563ea',
    color: '#2563ea',
  },
  buttonTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  additionalText: {
    marginLeft: 16, // Ajuste a margem esquerda conforme necessário
    color: '#333', // Cor do texto
    fontSize: 14, // Tamanho da fonte
    fontWeight: 'bold', // Peso da fonte
  },
});


