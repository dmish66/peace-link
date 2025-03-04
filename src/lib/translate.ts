import axios from "axios";

const GOOGLE_TRANSLATE_API_KEY = "AIzaSyBTZtIbEYMyq4cZVkt4GxakIzLrlZBLTrg";
const GOOGLE_TRANSLATE_URL = "https://translation.googleapis.com/language/translate/v2";

const countryToLanguageMap: Record<string, string> = {
    "Germany": "de",
    "United Kingdom": "en",
    "France": "fr",
    "Spain": "es",
    "Italy": "it",
    "Netherlands": "nl",
    "Poland": "pl",
    "Greece": "el",
    "Portugal": "pt",
    "Sweden": "sv",
    "Denmark": "da",
    "Norway": "no",
    "Finland": "fi",
    "Japan": "ja",
    "China": "zh",
    "Russia": "ru",
    "Brazil": "pt",
    "Mexico": "es",
    "United States": "en",
    "Canada": "en",
    "India": "hi",
    "Bulgaria": "bg",
  };
  
  /**
   * Converts a country name to its language code.
   */
  const getLanguageCode = (country: string): string => {
    return countryToLanguageMap[country] || "en"; // Default to English if unknown
  };
  
  /**
   * Translates text using Google Translate API.
   */
  export const translateText = async (text: string, country: string): Promise<string> => {
    const targetLanguage = getLanguageCode(country);
  
    try {
      const response = await axios.post(
        `${GOOGLE_TRANSLATE_URL}?key=${GOOGLE_TRANSLATE_API_KEY}`,
        {
          q: text,
          target: targetLanguage,
        }
      );
  
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error("Translation error:", error);
      return text; // Return original text if translation fails
    }
  };