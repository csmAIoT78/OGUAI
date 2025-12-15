import { ParsedSubstationData, ParsedEquipmentData } from "../types";

export const DataService = {
  parseSubstationCSV: (csvContent: string): ParsedSubstationData[] => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    // Simple check to validate format
    if (!headers.includes('substation_id') || !headers.includes('actual_load_mw')) {
      throw new Error("Invalid Substation CSV Format");
    }

    return lines.slice(1).map(line => {
      const vals = line.split(',');
      if (vals.length < 7) return null;
      return {
        timestamp: vals[0],
        substation_id: vals[1],
        capacity_mw: parseFloat(vals[2]),
        actual_load_mw: parseFloat(vals[3]),
        ambient_temp_f: parseFloat(vals[4]),
        status: vals[5],
        event_description: vals[6]
      };
    }).filter(Boolean) as ParsedSubstationData[];
  },

  parseEquipmentCSV: (csvContent: string): ParsedEquipmentData[] => {
    const lines = csvContent.trim().split('\n');
    const headers = lines[0].split(',');
    if (!headers.includes('device_id') || !headers.includes('vibration_mm_s')) {
      throw new Error("Invalid Equipment CSV Format");
    }

    return lines.slice(1).map(line => {
      const vals = line.split(',');
      if (vals.length < 7) return null;
      return {
        timestamp: vals[0],
        device_id: vals[1],
        temperature_C: parseFloat(vals[2]),
        vibration_mm_s: parseFloat(vals[3]),
        pressure_kpa: parseFloat(vals[4]),
        motor_amps: parseFloat(vals[5]),
        operational_status: vals[6]
      };
    }).filter(Boolean) as ParsedEquipmentData[];
  }
};
