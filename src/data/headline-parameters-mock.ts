/**
 * Mock data for the Five Headline Institutional Parameters
 * Based on the SLMS Composite Index approach from Roadmap/Five Parameters.md
 */

export interface Constituent {
  name: string;
  score: number;       // 0-100 (or higher if overachieving)
  weight: number;      // percentage weight (e.g., 25 for 25%)
  current: string;     // current value
  target: string;      // target value
  instAvg?: string;    // institutional average
  provAvg?: string;    // provincial average
  branchAvg?: string;  // branch average
  onClick?: () => void;
}

export interface HeadlineParameter {
  title: string;
  shortTitle: string;
  indexScore: number;
  instAvg: number;
  target: number;
  trend: '↑' | '↓' | '→';
  trendValue: string;
  constituents: Constituent[];
  colorScheme: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'cyan';
  onDrillDown?: () => void;
}

/**
 * Returns the five headline parameters with mock data.
 * Pass in optional onClick handlers for drill-down functionality.
 */
export function getHeadlineParameters(options?: {
  onStaffRatiosDrillDown?: () => void;
  onLCPerformanceDrillDown?: () => void;
  onProductsDrillDown?: () => void;
  onRiskDrillDown?: () => void;
  onRevenueDrillDown?: () => void;
  onCashLiquidityDrillDown?: () => void;
}): HeadlineParameter[] {
  return [
    {
      title: "Branch Structure & Staffing",
      shortTitle: "BSSI",
      indexScore: 76,
      instAvg: 78,
      target: 85,
      trend: '↓',
      trendValue: "-2pp from last month",
      colorScheme: 'blue',
      onDrillDown: options?.onStaffRatiosDrillDown,
      constituents: [
        {
          name: "Staff Adequacy Score",
          score: 97,
          weight: 25,
          current: "8/10 LCs",
          target: "10-12 LCs",
          instAvg: "85%",
          provAvg: "8/10 LCs",
          branchAvg: "8/10 LCs",
          onClick: options?.onStaffRatiosDrillDown
        },
        {
          name: "Productivity Achievement",
          score: 112,
          weight: 30,
          current: "K45k/LC",
          target: "K40k/LC",
          instAvg: "K38k/LC",
          provAvg: "K42k/LC",
          branchAvg: "K45k/LC"
        },
        {
          name: "Vacancy Impact",
          score: 80,
          weight: 20,
          current: "2 vacancies",
          target: "0 vacancies",
          instAvg: "1.2 avg",
          provAvg: "1.5 avg",
          branchAvg: "2 avg"
        },
        {
          name: "Portfolio Load Balance",
          score: 27,
          weight: 25,
          current: "K350k/LC",
          target: "K300k-380k",
          instAvg: "K320k",
          provAvg: "K330k/LC",
          branchAvg: "K350k/LC"
        }
      ]
    },
    {
      title: "Loan Consultant Performance",
      shortTitle: "LCPI",
      indexScore: 68,
      instAvg: 62,
      target: 80,
      trend: '↓',
      trendValue: "-9pp from last month",
      colorScheme: 'green',
      onDrillDown: options?.onLCPerformanceDrillDown,
      constituents: [
        {
          name: "Volume Achievement",
          score: 140,
          weight: 25,
          current: "K588k",
          target: "K420k",
          instAvg: "K380k",
          provAvg: "K450k",
          branchAvg: "K588k"
        },
        {
          name: "Portfolio Quality Score",
          score: 40,
          weight: 35,
          current: "PAR 20%",
          target: "PAR ≤8%",
          instAvg: "PAR 12%",
          provAvg: "PAR 18%",
          branchAvg: "PAR 20%"
        },
        {
          name: "Collection Efficiency",
          score: 60,
          weight: 30,
          current: "43%",
          target: "≥71.64%",
          instAvg: "58%",
          provAvg: "48%",
          branchAvg: "43%"
        },
        {
          name: "Vetting Compliance",
          score: 95,
          weight: 10,
          current: "95%",
          target: "100%",
          instAvg: "88%",
          provAvg: "92%",
          branchAvg: "95%"
        }
      ]
    },
    {
      title: "Loan Products & Interest Rates",
      shortTitle: "LPIRI",
      indexScore: 82,
      instAvg: 74,
      target: 80,
      trend: '↑',
      trendValue: "+3pp from last month",
      colorScheme: 'yellow',
      onDrillDown: options?.onProductsDrillDown,
      constituents: [
        {
          name: "Yield Achievement",
          score: 100,
          weight: 35,
          current: "38.2%",
          target: "38.2%",
          instAvg: "36.5%",
          provAvg: "37.5%",
          branchAvg: "38.2%"
        },
        {
          name: "Product Diversification",
          score: 70,
          weight: 25,
          current: "HHI 0.45",
          target: "HHI <0.3",
          instAvg: "HHI 0.38",
          provAvg: "HHI 0.42",
          branchAvg: "HHI 0.45"
        },
        {
          name: "Product Risk Score",
          score: 100,
          weight: 30,
          current: "Below avg",
          target: "≤ inst avg",
          instAvg: "At avg",
          provAvg: "Below avg",
          branchAvg: "Below avg"
        },
        {
          name: "Strategic Alignment",
          score: 0,
          weight: 10,
          current: "0% Motor Veh",
          target: "≥15%",
          instAvg: "8%",
          provAvg: "5%",
          branchAvg: "0%"
        }
      ]
    },
    {
      title: "Risk Management & Defaults Index",
      shortTitle: "RMDI",
      indexScore: 38,
      instAvg: 52,
      target: 75,
      trend: '↓',
      trendValue: "-12pp from last month",
      colorScheme: 'red',
      onDrillDown: options?.onRiskDrillDown,
      constituents: [
        {
          name: "Month-1 Default Performance",
          score: 50,
          weight: 40,
          current: "30% default",
          target: "≤25%",
          instAvg: "26.5%",
          provAvg: "28%",
          branchAvg: "30%"
        },
        {
          name: "3-Month Recovery Achievement",
          score: 43,
          weight: 30,
          current: "24%",
          target: "≥56.05%",
          instAvg: "42%",
          provAvg: "35%",
          branchAvg: "24%"
        },
        {
          name: "Roll-Rate Control",
          score: 30,
          weight: 20,
          current: "45% (30→60d)",
          target: "≤36.74%",
          instAvg: "35%",
          provAvg: "40%",
          branchAvg: "45%"
        },
        {
          name: "Long-Term Delinquency Risk",
          score: 89,
          weight: 10,
          current: "41%",
          target: "≤43.95%",
          instAvg: "44%",
          provAvg: "42%",
          branchAvg: "41%"
        }
      ]
    },
    {
      title: "Revenue & Performance Metrics Index",
      shortTitle: "RPMI",
      indexScore: 71,
      instAvg: 65,
      target: 75,
      trend: '→',
      trendValue: "stable",
      colorScheme: 'purple',
      onDrillDown: options?.onRevenueDrillDown,
      constituents: [
        {
          name: "Revenue Achievement",
          score: 85,
          weight: 40,
          current: "K355k",
          target: "K418k",
          instAvg: "K380k",
          provAvg: "K360k",
          branchAvg: "K355k"
        },
        {
          name: "Efficiency Ratio (CIR)",
          score: 73,
          weight: 30,
          current: "CIR 75%",
          target: "CIR ≤55%",
          instAvg: "CIR 65%",
          provAvg: "CIR 70%",
          branchAvg: "CIR 75%"
        },
        {
          name: "Profitability Contribution",
          score: 80,
          weight: 20,
          current: "Below avg",
          target: "≥ inst avg",
          instAvg: "At avg",
          provAvg: "Below avg",
          branchAvg: "Below avg"
        },
        {
          name: "Growth Trajectory",
          score: 0,
          weight: 10,
          current: "0% MoM",
          target: "≥2.5% MoM",
          instAvg: "1.8% MoM",
          provAvg: "1.0% MoM",
          branchAvg: "0% MoM"
        }
       ]
    },
    {
      title: "Cash & Liquidity Management Index",
      shortTitle: "CLMI",
      indexScore: 62,
      instAvg: 70,
      target: 95,
      trend: '↓',
      trendValue: "-5pp from last month",
      colorScheme: 'cyan',
      onDrillDown: options?.onCashLiquidityDrillDown,
      constituents: [
        {
          name: "Cash Position Score",
          score: 35,
          weight: 40,
          current: "K35,000",
          target: "K20,000-K30,000",
          instAvg: "K25,000",
          provAvg: "K28,000",
          branchAvg: "K35,000"
        },
        {
          name: "Above-Threshold Risk",
          score: 94,
          weight: 30,
          current: "K5,000 unapproved",
          target: "Zero unapproved excess",
          instAvg: "K2,000",
          provAvg: "K3,000",
          branchAvg: "K5,000"
        },
        {
          name: "Below-Threshold Risk",
          score: 62,
          weight: 20,
          current: "K15,000",
          target: "≥ K20,000",
          instAvg: "K22,000",
          provAvg: "K21,000",
          branchAvg: "K15,000"
        },
        {
          name: "Approved Exception Ratio",
          score: 76,
          weight: 10,
          current: "67% approved",
          target: "100% approved",
          instAvg: "85%",
          provAvg: "80%",
          branchAvg: "67%"
        }
      ]
    }
  ];
}
