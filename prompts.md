src/utils/userContext.ts:201-201
```
      role: String(user.role || 'executive'),
```

pass the dynamic job_position (int) not the fallback hard coded role.

and make user its fetched back based on the user.job_position as well to display in the time line

src/components/dashboards/InstitutionalHealthSummary.tsx:1602-1606
```
{!isLoading && !isCalculating && fetchedPrevMonthScores.length === 3 && (
                  <p className="text-xs text-gray-500 opacity-60">
                    Previous: {fetchedPrevMonthScores[2].score}% ({fetchedPrevMonthScores[2].label}) · Avg: {Math.round((fetchedPrevMonthScores[0].score + fetchedPrevMonthScores[1].score + fetchedPrevMonthScores[2].score) / 3)}% (3-month)
                  </p>
                )}
```