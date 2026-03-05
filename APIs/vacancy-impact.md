GET https://smartbackend.whencefinancesystem.com/vacancy-impact/3

<!-- office_id = 3 -->

{
  "office_id": "3",
  "actual_lcs": 14,<!--Total Loan Consultant staff-->
  "authorized_positions": 10,
  "vacancies": 0,
  "normalized_score": 1,<!--Total Average Score %-->
  "weight": "20%",<!-- Total weight for the consituent (20pp) -->
  "percentage_point": 0.2<!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->
  "target": 0 <!-- target is current not return in the api response but hard code it there. Greater or equal to 0 -->
}


remaining_Contribution = weight - percentage_point (pp); (represents what was lost due to underperformance) = Xpp (X is a number)
