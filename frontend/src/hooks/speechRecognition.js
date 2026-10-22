/** Browser provider adapter. A remote provider can implement the same start/stop interface later. */
export function createSpeechRecognition({ language, onText, onStatus, onError }) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!Recognition) {
    onError('Speech recognition is not supported in this browser. Try Chrome or Edge, or type your text below.')
    return null
  }
  const recognition = new Recognition()
  recognition.lang = language
  recognition.continuous = true
  recognition.interimResults = true
  recognition.onstart = () => onStatus('Listening')
  recognition.onend = () => onStatus('Ready')
  recognition.onerror = event => {
    const messages = {
      'not-allowed': 'Microphone permission was denied. Allow microphone access in browser settings.',
      'service-not-allowed': 'The browser speech service is unavailable for this site.',
      'no-speech': 'No speech detected. Try speaking a little closer to the microphone.',
      'audio-capture': 'No microphone was found. Check your audio input device.'
    }
    onError(messages[event.error] || `Speech recognition error: ${event.error}`)
  }
  recognition.onresult = event => {
    let interim = ''
    let finalText = ''
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const transcript = event.results[i][0].transcript
      if (event.results[i].isFinal) finalText += transcript
      else interim += transcript
    }
    onText({ finalText, interim })
  }
  return recognition
}
