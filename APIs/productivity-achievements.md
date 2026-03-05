GET https://smartbackend.whencefinancesystem.com/productivity-achievement/3

**parameter**
branch_id = 3


**response:**
{
  "office_id": "3",
  "consultant_count": 14, <!--Total Loan Consultant staff-->
  "average_disbursement": "10094.78",
  "normalized_score": "25.24",<!--Total Average Score %-->
  "weight": "30%", <!--meaning maximum possible contribution is 30pp-->
  "percentage_point": "7.57"<!--7.57pp scored is the actual contribution, put it on contribution column and calculate remaining contribution trend -->
  "target": 100% <!-- target is current not return in the api response but hard code it there. Greater or equal to 100 -->
}


<!-- remaining_Contribution = weight% - percentage_point (pp); (represents what was lost due to underperformance) = Xpp (X is a number) -->
Visual Example:
LOAN CONSULTANT PERFORMANCE INDEX: 68.2%
├─ Volume Achievement: 140% (Weight 25%) → Contributing 35.0pp of 25pp max
├─ Portfolio Quality Score: 40% (Weight 35%) → Contributing 14.0pp of 35pp max
├─ Collection Efficiency: 60% (Weight 30%) → Contributing 18.0pp of 30pp max
└─ Vetting Compliance: 95% (Weight 10%) → Contributing 9.5pp of 10pp max

Interpretation:
	Volume Achievement over-performed (gave 35pp where only 25pp was possible) - this shows as 35.0pp
	Portfolio Quality under-performed (only gave 14pp of the possible 35pp)
	The 21pp gap (35pp possible - 14pp actual) is what dragged the overall index down

