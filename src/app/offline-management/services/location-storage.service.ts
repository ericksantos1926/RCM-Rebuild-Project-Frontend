import { Injectable } from '@angular/core';
import { OfflineStorageService } from 'src/app/offline-management/services/offline-storage.service';
import { BarangayModel } from 'src/app/location/models';

const REGION_STORAGE_KEY = 'REGION_STORAGE_KEY';
const MUNICIPALITY_STORAGE_KEY = 'MUNICIPALITY_STORAGE_KEY';
const PROVINCE_STORAGE_KEY = 'PROVINCE_STORAGE_KEY';
const BARANGAY_STORAGE_KEY_PREFIX = 'BARANGAY_STORAGE_KEY';

@Injectable({
  providedIn: 'root'
})
export class LocationStorageService {

  constructor(private offlineStorage: OfflineStorageService) {
    
  }

  public async storeRegionData(data) {
    await this.offlineStorage.set(REGION_STORAGE_KEY, data);
    return true;
  }

  public async storeMunicipalityData(data) {
    const municipalitiesByProvince = [];

    data.forEach((municipality) => {
      const i = municipalitiesByProvince.findIndex((m) => m.provinceId === municipality.provinceId);

      if (i >= 0) {
        municipalitiesByProvince[i].municipalities.push(
          {
            value: municipality.id, 
            label: municipality.label, 
            runId: municipality.runId,
            soilFertility: municipality.soilFertility,
            provinceId: municipality.provinceId
          }
        );
      } else {
        municipalitiesByProvince.push({
          provinceId: municipality.provinceId,
          municipalities: [
            {
              value: municipality.id, 
              label: municipality.label, 
              runId: municipality.runId,
              soilFertility: municipality.soilFertility,
              provinceId: municipality.provinceId
            }
          ]
        })
      }
    });

    await municipalitiesByProvince.forEach(async (mp) => {
      await this.offlineStorage.set(`${MUNICIPALITY_STORAGE_KEY}_${mp.provinceId}`, mp.municipalities);
    })

    this.offlineStorage.set(MUNICIPALITY_STORAGE_KEY, data.map(m => (
      {
        value: m.id, 
        label: m.label, 
        runId: m.runId,
        soilFertility: m.soilFertility,
        provinceId: m.provinceId
      }
    )));

    return true;
  }

  public async getRegionData() {
    const res = await this.offlineStorage.get(REGION_STORAGE_KEY);
    return res;
  }

  public async getMunicipalityData() {
    const res = await this.offlineStorage.get(MUNICIPALITY_STORAGE_KEY);
    return res;
  }

  
  public async storeProvinceData(data) {
    await this.offlineStorage.set(PROVINCE_STORAGE_KEY, data);
    return true;
  }

  public async getProvinceData() {
    const res = await this.offlineStorage.get(PROVINCE_STORAGE_KEY);
    return res;
  }

  public async getProvinceDataByRegion(regionId: number) {
    const allProvinces = await this.getProvinceData();
    return allProvinces.filter((province) => province.regionId === regionId);
  }

  public async storeBarangayData(data) {
    const barangayByMunicipality = [];

    data.forEach((barangay: BarangayModel) => {
      const i = barangayByMunicipality.findIndex((b) => b.municipalId === barangay.municipalityId);

      if (i >= 0) {
        barangayByMunicipality[i].barangays.push({value: barangay.id, label: barangay.label});
      } else {
        barangayByMunicipality.push({
          municipalId: barangay.municipalityId,
          barangays: [{value: barangay.id, label: barangay.label}]
        })
      }
    });

    await barangayByMunicipality.forEach(async (bm) => {
      await this.offlineStorage.set(`${BARANGAY_STORAGE_KEY_PREFIX}_${bm.municipalId}`, bm.barangays);
    })

    this.offlineStorage.set(BARANGAY_STORAGE_KEY_PREFIX, 'barangay stored');

    
    return true;
  }

  public async getBarangayData() {
    const res = await this.offlineStorage.get(BARANGAY_STORAGE_KEY_PREFIX);
    return res;
  }

  public async getBarangayByMunicipality(municipalityId) {
    const res = await this.offlineStorage.get(`${BARANGAY_STORAGE_KEY_PREFIX}_${municipalityId}`);
    return res ? res.map(r => ({value: r.value.toString(), label: r.label})) : null;
  }

  public async getMunicipalitiesByProvince(provinceId) {
    const res = await this.offlineStorage.get(`${MUNICIPALITY_STORAGE_KEY}_${provinceId}`);
    return res ? res.map(r => ({value: r.value.toString(), label: r.label})) : null;
  }

  public async clearLocationData() {
    this.offlineStorage.clearByKey(REGION_STORAGE_KEY);
    this.offlineStorage.clearByKey(MUNICIPALITY_STORAGE_KEY);
    this.offlineStorage.clearByKey(PROVINCE_STORAGE_KEY);
    this.offlineStorage.clearByKey(BARANGAY_STORAGE_KEY_PREFIX);
  }
  
}
