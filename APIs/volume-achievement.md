GET https://smartbackend.whencefinancesystem.com/volume-achievement/3

<!-- param: office_id = 3 -->


Response:
{
  "office_id": "3",
  "consultant_count": 14, <!--Total Loan Consultant staff-->
  "total_disbursement": "141326.94",
  "branch_target": "420000",<!-- e.g target is Greater or equal to 420000 -->
  "normalized_score": "33.65",<!--Total Average Score %-->
  "weight": "25%",<!-- eig Total percentage point for the consituent here (25pp) -->
  "percentage_point": "8.41", <!--pp scored, put it on contribution and calculate remaining contribution and prev month trend comparision-->
}