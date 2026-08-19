export type PerformanceSignal = { topicId: string; accuracy: number; avgSeconds: number; expectedSeconds: number; confidence: number | null; recentAttempts: number; repeatedMistakes: number };
export type WeaknessScore = PerformanceSignal & { speedRisk:number; accuracyRisk:number; confidenceRisk:number; consistencyRisk:number; freshnessRisk:number; overallRisk:number; label:"CRITICAL"|"HIGH"|"MODERATE"|"LOW" };
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
export function scoreWeakness(s:PerformanceSignal):WeaknessScore{
 const speedRisk=clamp((s.avgSeconds/Math.max(1,s.expectedSeconds)-1)/1.5), accuracyRisk=clamp(1-s.accuracy), confidenceRisk=s.confidence==null?0.25:clamp(s.confidence/5), consistencyRisk=clamp(s.repeatedMistakes/Math.max(1,s.recentAttempts)), freshnessRisk=clamp(1-Math.min(s.recentAttempts/8,1));
 const overallRisk=clamp(accuracyRisk*.35+speedRisk*.25+consistencyRisk*.2+confidenceRisk*.1+freshnessRisk*.1);
 const label=overallRisk>=.75?"CRITICAL":overallRisk>=.55?"HIGH":overallRisk>=.35?"MODERATE":"LOW";
 return {...s,speedRisk,accuracyRisk,confidenceRisk,consistencyRisk,freshnessRisk,overallRisk,label};
}
export function rankWeaknesses(signals:PerformanceSignal[]){return signals.map(scoreWeakness).sort((a,b)=>b.overallRisk-a.overallRisk)}
export function interventionForWeakness(s:WeaknessScore){if(s.accuracyRisk>.55&&s.speedRisk>.45)return "CONCEPT_REBUILD";if(s.accuracyRisk>.55)return "TARGETED_PRACTICE";if(s.speedRisk>.45)return "TIMED_PRACTICE";if(s.consistencyRisk>.4)return "ERROR_PATTERN_REVIEW";if(s.freshnessRisk>.5)return "REVISION";return "REINFORCE"}
