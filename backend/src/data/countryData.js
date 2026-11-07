/**
 * LifeGraph 2.0 - Country Data Interface & Re-export
 * Bridges country datasets and healthcare statistics for international gameplay.
 */
import { COUNTRY_BIGDATA, getCountryBigData, generateCulturallyAuthenticName, extractFamilySurname } from './countryBigData.js';

export const COUNTRY_DATA = COUNTRY_BIGDATA;
export { COUNTRY_BIGDATA, getCountryBigData, generateCulturallyAuthenticName, extractFamilySurname };
export const getCountryData = getCountryBigData;
export default COUNTRY_BIGDATA;
