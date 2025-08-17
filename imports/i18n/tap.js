import { ReactiveCache } from '/imports/reactiveCache';
import { Meteor } from 'meteor/meteor';
import { ReactiveVar } from 'meteor/reactive-var';
import Translation from '/models/translation';
import i18next from 'i18next';
import sprintf from 'i18next-sprintf-postprocessor';
import languages from './languages';

const DEFAULT_NAMESPACE = 'translation';
const DEFAULT_LANGUAGE = 'en';

// Language detection utilities
const detectBrowserLanguage = () => {
  if (Meteor.isClient) {
    const browserLang = navigator.language || navigator.userLanguage;
    const shortLang = browserLang.split('-')[0];
    
    // Check if we have an exact match
    if (languages[browserLang]) {
      return browserLang;
    }
    
    // Check if we have a short language match
    for (const [tag, lang] of Object.entries(languages)) {
      if (lang.code === shortLang) {
        return tag;
      }
    }
  }
  return DEFAULT_LANGUAGE;
};

const getSavedLanguage = () => {
  if (Meteor.isClient) {
    return localStorage.getItem('wekan-language') || sessionStorage.getItem('wekan-language');
  }
  return null;
};

const saveLanguage = (language) => {
  if (Meteor.isClient) {
    localStorage.setItem('wekan-language', language);
    sessionStorage.setItem('wekan-language', language);
  }
};

// Carefully reproduced tap:i18n API with enhanced functionality
export const TAPi18n = {
  i18n: null,
  current: new ReactiveVar(DEFAULT_LANGUAGE),
  currentRTL: new ReactiveVar(false),
  async init() {
    this.i18n = i18next.createInstance().use(sprintf);
    
    // Determine initial language
    const savedLang = getSavedLanguage();
    const browserLang = detectBrowserLanguage();
    const initialLang = savedLang || browserLang;
    
    await this.i18n.init({
      fallbackLng: DEFAULT_LANGUAGE,
      cleanCode: true,
      debug: process.env.DEBUG === 'true',
      supportedLngs: Object.values(languages).map(({ tag }) => tag),
      ns: DEFAULT_NAMESPACE,
      defaultNs: DEFAULT_NAMESPACE,
      postProcess: ["sprintf"],
      interpolation: {
        prefix: '__',
        suffix: '__',
        escapeValue: false,
      },
      resources: {},
    });
    
    // Load the initial language
    await this.setLanguage(initialLang);
  },
  
  isLanguageSupported(language) {
    return Object.values(languages).some(({ tag }) => tag === language);
  },
  
  getSupportedLanguages() {
    return Object.values(languages).map(({ name, code, tag, rtl }) => ({ 
      name, 
      code, 
      tag, 
      rtl: rtl === "true" 
    }));
  },
  
  getLanguage() {
    return this.current.get();
  },
  
  isRTL() {
    return this.currentRTL.get();
  },
  
  async loadLanguage(language) {
    if (language in languages && 'load' in languages[language]) {
      try {
        const data = await languages[language].load();
        
        // Add the language bundle to i18next
        this.i18n.addResourceBundle(language, DEFAULT_NAMESPACE, data);
        
        // Update RTL status
        const langConfig = languages[language];
        this.currentRTL.set(langConfig.rtl === "true");
        
        return data;
      } catch (error) {
        console.error(`Failed to load language ${language}:`, error);
        throw error;
      }
    } else {
      throw new Error(`Language ${language} is not supported`);
    }
  },
  
  async setLanguage(language) {
    if (!this.isLanguageSupported(language)) {
      throw new Error(`Language ${language} is not supported`);
    }
    
    // Load the language if not already loaded
    if (!this.i18n.hasResourceBundle(language, DEFAULT_NAMESPACE)) {
      await this.loadLanguage(language);
    }
    
    // Change the language
    await this.i18n.changeLanguage(language);
    this.current.set(language);
    
    // Save the language preference
    saveLanguage(language);
    
    // Update RTL status
    const langConfig = languages[language];
    this.currentRTL.set(langConfig.rtl === "true");
    
    // Update document direction for RTL support
    if (Meteor.isClient) {
      document.documentElement.dir = langConfig.rtl === "true" ? "rtl" : "ltr";
      document.documentElement.lang = language;
    }
  },
  
  // Return translation by key
  __(key, options = {}, language) {
    this.current.dep.depend();
    return this.i18n.t(key, {
      ...options,
      lng: language || this.current.get(),
    });
  },
  
  // Get current language configuration
  getCurrentLanguageConfig() {
    const currentLang = this.current.get();
    return languages[currentLang] || languages[DEFAULT_LANGUAGE];
  },
  
  // Check if current language is RTL
  isCurrentLanguageRTL() {
    const config = this.getCurrentLanguageConfig();
    return config.rtl === "true";
  }
};
