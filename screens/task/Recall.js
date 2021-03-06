import React from 'react'
import { StyleSheet, View, TextInput, Button, Alert, Text } from 'react-native'
import _ from 'lodash'
import request from '../../services/request'

const MARK_NEW = 0
const MARK_REMEMBER = 1
const MARK_FORGOTTEN = 2

export default class Recall extends React.Component {
  static navigationOptions = {
    title: 'Recall'
  }

  state = {
    collectionName: '',
    taskName: '',
    words: [],
    word: '',
    desc: '',
    translate: '',
    showWord: false,
  }

  componentDidMount() {
    request('/task/get', { id: 1 })
      .then(payload => {
        if (!payload) {
          this.props.navigation.navigate('Home')
          return
        }

        let newState = {
          collectionName: payload.collection_name,
          taskName: payload.task_name,
        }

        newState.words = _.map(payload.words, word => {
          word.mark = MARK_NEW
          return word
        })

        this.setState(newState, this.nextWord)
      })
  }

  getRemembered = () => {
    return _(this.state.words)
      .filter(['mark', MARK_REMEMBER])
      .size()
  }

  nextWord = () => {
    let words = _.filter(this.state.words, ['mark', MARK_NEW])
    if (_.isEmpty(words)) {
      words = _.filter(this.state.words, ['mark', MARK_FORGOTTEN])
    }

    if (_.isEmpty(words)) {
      Alert.alert('Tango', 'All words remembered.', [
        {
          text: 'OK',
          onPress: () => {
            this.props.navigation.navigate('Home')
          }
        }
      ], { cancelable: false })
      return
    }

    let word = _.sample(words)
    let newState = _.pick(word, ['word', 'desc', 'translate'])
    newState.showWord = false
    this.setState(newState)
  }

  showWord = () => {
    this.setState({
      showWord: true,
    })
  }

  markWord = (mark) => {
    let words = _.cloneDeep(this.state.words)
    let word = _.find(words, ['word', this.state.word])
    word.mark = mark
    this.setState({
      words,
    }, this.nextWord)
  }

  render () {
    const { navigate } = this.props.navigation
    return (
      <View style={styles.container}>
        <Text>{this.state.collectionName} {this.state.taskName}</Text>
        <Text>Progress {this.getRemembered()} / {this.state.words.length}</Text>
        <Text>{this.state.translate}</Text>
        <View>
          <Button
            title="Show"
            onPress={this.showWord}
          />
        </View>

        {this.state.showWord ? (
          <View>
            <Text>{this.state.word} {this.state.desc}</Text>

            <View style={{ flexDirection: 'row' }}>
              <View style={styles.rememberButton}>
                <Button
                  title="Remember"
                  onPress={() => this.markWord(MARK_REMEMBER)}
                />
              </View>
              <View style={styles.forgottenButon}>
                <Button
                  title="Forgotton"
                  onPress={() => this.markWord(MARK_FORGOTTEN)}
                />
              </View>
            </View>
          </View>
        ) : null}
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 15,
  },
  rememberButton: {
    flex: 1,
    marginRight: 7.5,
  },
  forgottenButon: {
    flex: 1,
    marginLeft: 7.5,
  }
})
