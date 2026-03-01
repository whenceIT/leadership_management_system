/**
 * Mock data for the Five Headline Institutional Parameters
 * Based on the SLMS Composite Index approach from Roadmap/Five Parameters.md
 */

export interface Constituent {
  name: string;
  score: number;       // 0-100 (or higher if overachieving)
  weight: number;      // percentage weight (e.g., 25 for 25%)
  actual: string;      // display value (e.g., "30%", "K45k")
  target: string;      // target value
  instAvg?: string;    // institutional average
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
  colorScheme: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
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
}): HeadlineParameter[] {
  return [
    {
      title: "Branch Structure & Staffing Index",
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
          score: 80,
          weight: 25,
          actual: "8/10 LCs",
          target: "10-12 LCs",
          instAvg: "85%",
          onClick: options?.onStaffRatiosDrillDown
        },
        {
          name: "Productivity Achievement",
          score: 112,
          weight: 30,
          actual: "K45k/LC",
          target: "K40k/LC",
          instAvg: "K38k/LC"
        },
        {
          name: "Vacancy Impact",
          score: 80,
          weight: 20,
          actual: "2 vacancies",
          target: "0 vacancies",
          instAvg: "1.2 avg"
        },
        {
          name: "Portfolio Load Balance",
          score: 27,
          weight: 25,
          actual: "K350k/LC",
          target: "K300k-380k",
          instAvg: "K320k"
        }
      ]
    },
    {
      title: "Loan Consultant Performance Index",
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
          actual: "K588k",
          target: "K420k",
          instAvg: "K380k"
        },
        {
          name: "Portfolio Quality Score",
          score: 40,
          weight: 35,
          actual: "PAR 20%",
          target: "PAR ≤8%",
          instAvg: "PAR 12%"
        },
        {
          name: "Collection Efficiency",
          score: 60,
          weight: 30,
          actual: "43%",
          target: "≥71.64%",
          instAvg: "58%"
        },
        {
          name: "Vetting Compliance",
          score: 95,
          weight: 10,
          actual: "95%",
          target: "100%",
          instAvg: "88%"
        }
      ]
    },
    {
      title: "Loan Products & Interest Rates Index",
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
          actual: "38.2%",
          target: "38.2%",
          instAvg: "36.5%"
        },
        {
          name: "Product Diversification",
          score: 70,
          weight: 25,
          actual: "HHI 0.45",
          target: "HHI <0.3",
          instAvg: "HHI 0.38"
        },
        {
          name: "Product Risk Score",
          score: 100,
          weight: 30,
          actual: "Below avg",
          target: "≤ inst avg",
          instAvg: "At avg"
        },
        {
          name: "Strategic Alignment",
          score: 0,
          weight: 10,
          actual: "0% Motor Veh",
          target: "≥15%",
          instAvg: "8%"
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
          actual: "30% default",
          target: "≤25%",
          instAvg: "26.5%"
        },
        {
          name: "3-Month Recovery Achievement",
          score: 43,
          weight: 30,
          actual: "24%",
          target: "≥56.05%",
          instAvg: "42%"
        },
        {
          name: "Roll-Rate Control",
          score: 30,
          weight: 20,
          actual: "45% (30→60d)",
          target: "≤36.74%",
          instAvg: "35%"
        },
        {
          name: "Long-Term Delinquency Risk",
          score: 89,
          weight: 10,
          actual: "41%",
          target: "≤43.95%",
          instAvg: "44%"
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
          actual: "K355k",
          target: "K418k",
          instAvg: "K380k"
        },
        {
          name: "Efficiency Ratio (CIR)",
          score: 73,
          weight: 30,
          actual: "CIR 75%",
          target: "CIR ≤55%",
          instAvg: "CIR 65%"
        },
        {
          name: "Profitability Contribution",
          score: 80,
          weight: 20,
          actual: "Below avg",
          target: "≥ inst avg",
          instAvg: "At avg"
        },
        {
          name: "Growth Trajectory",
          score: 0,
          weight: 10,
          actual: "0% MoM",
          target: "≥2.5% MoM",
          instAvg: "1.8% MoM"
        }
      ]
    }
  ];
}
