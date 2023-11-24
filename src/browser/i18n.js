import i18n from 'i18next'
import { i18nResource } from 'neo4j-arc'
import { initReactI18next } from 'react-i18next'

const resources = i18nResource

i18n.use(initReactI18next).init({
  resources,
  lng: 'en',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
