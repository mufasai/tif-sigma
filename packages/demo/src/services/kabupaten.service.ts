import { kabupatenData, processKabupatenData } from '../data/kabupaten.data';

export const loadKabupatenData = async () => {
  try {
    const response = await fetch('/data/kota-kabupaten.json');
    if (!response.ok) {
      throw new Error('Failed to load kabupaten data');
    }
    const data = await response.json();
    
    // Process the data and store it in kabupatenData
    Object.assign(kabupatenData, processKabupatenData(data));
    
    console.log(`Loaded ${Object.keys(kabupatenData).length} kabupaten/kota`);
    return true;
  } catch (error) {
    console.error('Error loading kabupaten data:', error);
    return false;
  }
};
