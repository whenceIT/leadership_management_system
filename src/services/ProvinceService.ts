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
   * @param skipCashBalance - If true, skip fetching cash balances from ledger API
   */
  public async getProvincesWithOfficeCounts(skipCashBalance = false): Promise<Province[]> {
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
      console.log('Provinces', data);
      const offices = Array.isArray(data) ? data : (data.data || []);

      // Count offices by province
      const officeCounts: { [provinceId: string]: number } = {};
      offices.forEach((office: any) => {
        const provinceId = office.province_id || office.provinceId;
        if (provinceId) {
          const provinceIdStr = provinceId.toString();
          officeCounts[provinceIdStr] = (officeCounts[provinceIdStr] || 0) + 1;
        }
      });

      // Get provinces and add office counts
      const provinces = await this.getProvinces();
      
      if (skipCashBalance) {
        return provinces.map(province => ({
          ...province,
          offices_count: officeCounts[province.id.toString()] || 0
        }));
      }

      // Group offices by province for cash balance calculation
      const provinceOffices: { [provinceId: string]: any[] } = {};
      offices.forEach((office: any) => {
        const provinceId = office.province_id || office.provinceId;
        if (provinceId) {
          const provinceIdStr = provinceId.toString();
          if (!provinceOffices[provinceIdStr]) {
            provinceOffices[provinceIdStr] = [];
          }
          provinceOffices[provinceIdStr].push(office);
        }
      });

      // Calculate cash balance per province from ledger API
      const cashBalances: { [provinceId: string]: number } = {};
      
      for (const [provinceId, provOffices] of Object.entries(provinceOffices)) {
        let totalCash = 0;
        
        // Get unique wallet IDs for this province
        const walletIds = provOffices
          .map(o => o.withinhereWalletId || o.withinhere_wallet_id)
          .filter((id): id is string => !!id);
        
        // Fetch cash balances from ledger API for offices with wallet IDs
        if (walletIds.length > 0) {
          const ledgerPromises = walletIds.map(walletId => 
            fetch('https://withinheremobileapi.com/api/v1/lmsuser/branch_ledger', {
              method: 'POST',
              cache: "no-store",
              headers: {
                'Content-Type': 'application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
              },
              body: JSON.stringify({
                wallet_id: walletId,
                start_date: '2026-01-01',
                end_date: new Date().toISOString().split('T')[0]
              })
            })
            .then(res => res.ok ? res.json() : { user: { cash_balance: '0' } })
            .then(result => result?.success ? parseFloat(result?.user?.cash_balance || '0') : 0)
            .catch(() => 0)
          );
          
          const cashBalancesList = await Promise.all(ledgerPromises);
          totalCash = cashBalancesList.reduce((sum, cash) => sum + cash, 0);
        }
        
        cashBalances[provinceId] = totalCash;
      }

      return provinces.map(province => ({
        ...province,
        offices_count: officeCounts[province.id.toString()] || 0,
        totalCashBalance: cashBalances[province.id.toString()] || 0
      }));

    } catch (error) {
      console.error('Error fetching province data:', error);
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
