import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { resources } from 'neo4j-arc/graph-visualization'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
