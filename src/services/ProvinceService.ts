export interface Province {
  id: number;
  name: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * ProvinceService manages province data with built-in caching
 */
export class ProvinceService {
  private static instance: ProvinceService;
  private provinces: Province[];

  private constructor() {
    this.provinces = [
      { id: 1, name: 'LUSAKA' },
      { id: 2, name: 'COPPERBELT' },
      { id: 3, name: 'EASTERN' },
      { id: 4, name: 'CENTRAL' },
      { id: 5, name: 'MUCHINGA' },
      { id: 6, name: 'NORTHERN' },
      { id: 7, name: 'NORTH WESTERN' },
      { id: 8, name: 'WESTERN' },
      { id: 9, name: 'SOUTHERN' },
      { id: 10, name: 'LUAPULA' }
    ];
  }

  /**
   * Get singleton instance of ProvinceService
   */
  public static getInstance(): ProvinceService {
    if (!ProvinceService.instance) {
      ProvinceService.instance = new ProvinceService();
    }
    return ProvinceService.instance;
  }

  /**
   * Get all provinces
   */
  public async getProvinces(): Promise<Province[]> {
    return Promise.resolve([...this.provinces]);
  }

  /**
   * Get province by ID
   */
  public async getProvinceById(id: number): Promise<Province | undefined> {
    const provinces = await this.getProvinces();
    return provinces.find(province => province.id === id);
  }

  /**
   * Get province by name
   */
  public async getProvinceByName(name: string): Promise<Province | undefined> {
    const provinces = await this.getProvinces();
    return provinces.find(province => province.name.toUpperCase() === name.toUpperCase());
  }

  /**
   * Search provinces by name (case-insensitive)
   */
  public async searchProvinces(query: string): Promise<Province[]> {
    const provinces = await this.getProvinces();
    if (!query) return provinces;
    
    const searchTerm = query.toLowerCase();
    return provinces.filter(province => 
      province.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Get sorted list of provinces (alphabetical order)
   */
  public async getSortedProvinces(): Promise<Province[]> {
    const provinces = await this.getProvinces();
    return [...provinces].sort((a, b) => a.name.localeCompare(b.name));
  }
}

export default ProvinceService;
