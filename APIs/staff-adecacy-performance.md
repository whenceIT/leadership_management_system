GET https://smartbackend.whencefinancesystem.com/staff-adequacy/3

**parameter**
branch_id = 3


**response:**
{
  "office_id": "3",
  "actual_lcs": 14, <!--Total Loan Consultant staff-->
  "normalized_score": 100, <!--Total Average Score %-->
  "weight": "25%", <!-- Total weight for the consituent -->
  "percentage_point": 25 <!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->
  "target": 100% <!--target is current not return in the api response but hard code it there -->
}


remaining_Contribution = weight% - percentage_point (pp); (represents what was lost due to underperformance) = Xpp (X is a number)


