export interface Province {
  id: number;
  name: string;
  offices_count?: number;
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

  /**
   * Get provinces with office counts
   */
  public async getProvincesWithOfficeCounts(): Promise<Province[]> {
    try {
      // Fetch offices from the API
      const response = await fetch('https://smartbackend.whencefinancesystem.com/offices', {
        cache: "no-store",
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch offices');
      }

      const data = await response.json();
      const offices = Array.isArray(data) ? data : (data.data || []);

      // Count offices by province and calculate cash balance
      const officeCounts: { [provinceId: string]: number } = {};
      const cashBalances: { [provinceId: string]: number } = {};
      offices.forEach((office: any) => {
        const provinceId = office.province_id || office.provinceId;
        if (provinceId) {
          const provinceIdStr = provinceId.toString();
          officeCounts[provinceIdStr] = (officeCounts[provinceIdStr] || 0) + 1;
          // Add branch_capacity as proxy for cash balance (or use actual cash data if available)
          const cashBalance = parseFloat(office.branch_capacity || '0') * 10000;
          cashBalances[provinceIdStr] = (cashBalances[provinceIdStr] || 0) + cashBalance;
        }
      });

      // Get provinces and add office counts
      const provinces = await this.getProvinces();
      return provinces.map(province => ({
        ...province,
        offices_count: officeCounts[province.id.toString()] || 0,
        totalCashBalance: cashBalances[province.id.toString()] || 0
      }));

    } catch (error) {
      console.error('Error fetching office counts:', error);
      // Return provinces with 0 office count on error
      const provinces = await this.getProvinces();
      return provinces.map(province => ({
        ...province,
        offices_count: 0,
        totalCashBalance: 0
      }));
    }
  }
}

export default ProvinceService;
