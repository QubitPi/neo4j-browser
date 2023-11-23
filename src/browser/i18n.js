import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      'graph summary':
        'Displaying {{nodeCount}} nodes, {{relationshipCount}} relationships.'
    }
  },
  zh: {
    translation: {
      'graph summary': '总计 {{nodeCount}} 个节点, {{relationshipCount}} 条边.'
    }
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  })

export default i18n
