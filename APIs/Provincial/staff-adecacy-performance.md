GET https://smartbackend.whencefinancesystem.com/staff-adequacy/province/3

**parameter**
branch_id = 3


**response:**
{

  "province_id": "3",
  "offices_count": 4,
  "average_normalized_score": 100,<!--Total Average Score %-->
  "weight": "25%",<!-- Total weight for the consituent -->
  "percentage_point": 25 <!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->



}


remaining_Contribution = weight% - percentage_point (pp); (represents what was lost due to underperformance) = Xpp (X is a number)


