import { Dispatch, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter, useNavigation, useSearchParams, Link } from "expo-router";
import { ScrollView, HStack, VStack, List, NativeBaseProvider } from 'native-base';
import { Card, Title, Button, IconButton, Chip, Tooltip, Provider} from 'react-native-paper';
import { ChapterAssunto } from '../../../../models/ChapterAssunto';
import { obterChaptersAssuntoComentario } from '../../../../core/services/ChapterAssuntoComentarioService';
import { Tag } from '../../../../models/Tag';
import { obterTags } from '../../../../core/services/TagService';
import { obterChaptersAssunto } from '../../../../core/services/ChapterAssuntoService';


function ListTags(chaptersAssunto: ChapterAssunto[], setChaptersAssunto: Dispatch<ChapterAssunto[]>) {
  const [tags, setTags] = useState<Tag[]>([]);
  useEffect(() => {
    setTags(obterTags());
  }, [])
  
  return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} flexGrow={0} style={{borderBottomWidth: 1, borderTopWidth: 1, borderColor: 'gray'}}>
        <HStack space={1}>
          {listarTags(chaptersAssunto, setChaptersAssunto,tags)}
        </HStack>
      </ScrollView>
  )
};

const listarTags = (chaptersAssunto: ChapterAssunto[], setChaptersAssunto: Dispatch<ChapterAssunto[]>, tags: Tag[]) => tags.map(tag => (
  <List style={{borderWidth: 0, paddingTop: 7, paddingBottom: 7, paddingLeft: 3, paddingRight: 3}} key={tag.id}>{TagUc(chaptersAssunto, setChaptersAssunto, tag)}</List>
))

function TagUc(chaptersAssunto: ChapterAssunto[], setChaptersAssunto: Dispatch<ChapterAssunto[]>, tag: Tag) {
  return(
    <Chip mode='outlined' textStyle={{marginVertical: 0, color: 'blue'}} onPress={() => filtroUc(chaptersAssunto, setChaptersAssunto, tag.id)}>{tag.nome}</Chip>
  )
};

function filtroUc(chaptersAssunto: ChapterAssunto[], setChaptersAssunto: Dispatch<ChapterAssunto[]>, tagId: number){
  var newList : ChapterAssunto[] = [];
  chaptersAssunto.map(chapterAssunto => (
    chapterAssunto.tags?.forEach(chapterAssuntoTag => {
      if(chapterAssuntoTag.id == tagId){
        newList.push(chapterAssunto); 
      }
    }
    )
  ))
  return(setChaptersAssunto(newList))
}



function ListChaptersAssunto(setChaptersAssunto: Dispatch<ChapterAssunto[]>, chaptersAssunto: ChapterAssunto[]) {
  
  return(
        <ScrollView >
            <VStack style={{paddingBottom: 20, marginBottom: 15}}>
                {listarChaptersAssunto(setChaptersAssunto, chaptersAssunto)}
            </VStack>
        </ScrollView>
    )
}

function listarChaptersAssunto(setChaptersAssunto: Dispatch<ChapterAssunto[]>, list : ChapterAssunto[]) {
    const router = useRouter();
    return(
        (list.map(assunto => (
            <Card style={styles.card} key={assunto.key} onPress={() => router.push({ pathname: '/forum/Topico', params: { title: assunto.title, descricao: assunto.description, autor: assunto.author.apelido, time: assunto.time } })}>
               <Card.Content style={styles.cardConteudo}>
                 <View style={styles.cardTopSide}>
                   <Title style={{fontSize: 20, width: '85%'}}>{assunto.title}</Title>
                   {(assunto.respondida)?<IconButton icon="check-circle"  iconColor='blue' size={15} onPress={() => (console.log('check'))}/>:<></>}
                 </View>
                 <View style={styles.subTitleContainer}>
                 {(assunto.tags === undefined)?<></>:listarTags(list, setChaptersAssunto, assunto.tags)}
                 </View>
                 <View style={styles.cardBotSide}>
                   <Button icon='comment' style={{minWidth: 15}} contentStyle={{flexDirection: 'row-reverse', gap:10, justifyContent: 'flex-end'}} labelStyle={{marginHorizontal: 0, marginVertical: 0, color: 'blue'}}>{assunto.comments}</Button>
                   <Button icon='eye-outline' style={{minWidth: 15}} contentStyle={{flexDirection: 'row-reverse', gap:10, justifyContent: 'flex-end'}} labelStyle={{marginHorizontal: 0, marginVertical: 0, color: 'blue'}}>{assunto.views}</Button>
                 </View>
               </Card.Content>
             </Card>
        )))
    )
};

export default function Forum() {
const router = useRouter();
const navigation = useNavigation();

const [chaptersAssunto, setChaptersAssunto] = useState<ChapterAssunto[]>([]);
useEffect(() => {setChaptersAssunto(obterChaptersAssunto())}, [])

  return (
    <NativeBaseProvider>
      <View style={styles.container}>
        <View>
        <Link href={'Perguntar'} asChild ><Button style={styles.pergunta} labelStyle={{fontSize: 16, color: 'white'}}>Pergunta</Button></Link>
          {ListTags(chaptersAssunto, setChaptersAssunto)}
        </View>
        <View style={{flex: 1}}>
          {ListChaptersAssunto(setChaptersAssunto, chaptersAssunto)}
        </View>
      </View>
    </NativeBaseProvider>  
  );
}

const styles = StyleSheet.create({
  card: {
    marginLeft: '3%',
    marginRight: '3%',
    marginTop: '5%',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    flexDirection: 'column',
    paddingHorizontal: 0
  },
  cardConteudo:{
    paddingVertical: 0,
    paddingLeft: 8,
    paddingBottom: 8,
    paddingHorizontal: 0,
    width: '100%'
  },
  cardTopSide: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cardBotSide: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%'
  },
  subTitleContainer: {
    flexDirection: 'row',
    gap: 3,
    justifyContent: 'flex-start'
  },
  Text:{
    margin: 0
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  cardButton: {
    height: 35,
    width: 75,
    padding: 0,
  },
  cardButtonText:{
    fontSize: 11,
    paddingTop: 0,
    color: 'black',
    marginBottom: 15
  },
  pergunta: {
    marginTop: '5%',
    marginBottom: '5%',
    backgroundColor: 'darkgray',
    marginLeft: '20%',
    marginRight: '20%'
  }
});
