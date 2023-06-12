import { View, Image, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useEffect, useState } from "react";
import { FlashList } from '@shopify/flash-list';
import { Grupo } from "../../../models/Grupo";
import { getFrequenciaByEstudanteIdByPeriodoId } from '../../../core/services/FrequenciaService';
import { getAllGrupos, getGruposByEstudanteIdByPeriodoId } from '../../../core/services/GrupoService';
import ListaGrupo from '../../../components/ListaGrupo';
import { Header } from 'react-native/Libraries/NewAppScreen';
import ProfileScreen from '../../../components/Dashboard/ProfileScreen';
import { ScrollView } from 'react-native-gesture-handler';

export default function ListaUC() {

  const idPeriodo = 2;
  const idEstudante = 1;
  const {frequencias} = getFrequenciaByEstudanteIdByPeriodoId(idEstudante,idPeriodo);
  //const {grupos} = getAllGrupos();
  const {grupos} = getGruposByEstudanteIdByPeriodoId(idEstudante, idPeriodo)
  const [isLoaded, setIsLoaded] = useState(false)


  useEffect(() => {
    grupos.forEach(
      (g) => {
          var freq = frequencias.filter((f) =>(f.grupoId == g.id));
          if(freq.length != 0){
            g.frequencia = freq[0].frequencia;
            setIsLoaded(true)
          }
      }
    )
  },[grupos, frequencias])


  return (
    <View style={styles.container}>
      <ProfileScreen />
      {isLoaded && <FlashList
        ListHeaderComponent={<HeaderCursos/>}
        data={grupos}
        estimatedItemSize={8}
        numColumns={1}
        renderItem = { ({item}) => <ListaGrupo {...item}/>}
        keyExtractor={(item) => item.id.toString()}
        />}
      </View>
  )
}

  const HeaderCursos = () => {
    return (
      <Text style={{margin:5, marginTop: 20, fontSize: 20, fontFamily: 'PoppinsBold'}}>Meus Cursos</Text>
    )
  }

const styles = StyleSheet.create({
  container: {
    flex:1,
    marginHorizontal: 10
  },

})