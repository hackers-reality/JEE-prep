export type FixedBlock = { id: string; title: string; startMinute: number; endMinute: number; locked?: boolean };
export type ScheduleInput = { wakeMinute: number; sleepMinute: number; fixedBlocks: FixedBlock[]; bufferPercent?: number; minStudyBlockMinutes?: number; maxStudyBlockMinutes?: number };
export type StudyCandidate = { id: string; title: string; minutes: number; priority?: number; kind?: "THEORY" | "PRACTICE" | "REVISION" | "TEST" };
export type PlannedBlock = { id: string; title: string; kind: string; startMinute: number; endMinute: number; sourceTaskId?: string };

const clamp = (n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));

export function freeWindows(input: ScheduleInput): Array<{startMinute:number;endMinute:number}> {
  const dayEnd = input.sleepMinute > input.wakeMinute ? input.sleepMinute : input.sleepMinute + 1440;
  const blocks = input.fixedBlocks.map(b=>({startMinute:b.startMinute< input.wakeMinute?b.startMinute+1440:b.startMinute,endMinute:b.endMinute<=b.startMinute?b.endMinute+1440:b.endMinute})).sort((a,b)=>a.startMinute-b.startMinute);
  const windows:Array<{startMinute:number;endMinute:number}> = [];
  let cursor=input.wakeMinute;
  for(const b of blocks){ if(b.endMinute<=cursor) continue; if(b.startMinute>cursor) windows.push({startMinute:cursor,endMinute:Math.min(b.startMinute,dayEnd)}); cursor=Math.max(cursor,b.endMinute); if(cursor>=dayEnd) break; }
  if(cursor<dayEnd) windows.push({startMinute:cursor,endMinute:dayEnd});
  return windows.filter(w=>w.endMinute-w.startMinute>0);
}

export function buildDailySchedule(input: ScheduleInput, candidates: StudyCandidate[]): {blocks:PlannedBlock[];unscheduled:StudyCandidate[]} {
  const minBlock=clamp(input.minStudyBlockMinutes??30,15,180), maxBlock=clamp(input.maxStudyBlockMinutes??120,minBlock,240);
  const buffer=(input.bufferPercent??10)/100;
  const ordered=[...candidates].sort((a,b)=>(b.priority??2)-(a.priority??2));
  const blocks:PlannedBlock[]=[]; const unscheduled:StudyCandidate[]=[];
  for(const window of freeWindows(input)){
    let cursor=window.startMinute; const usable=Math.floor((window.endMinute-window.startMinute)*(1-buffer));
    const limit=window.startMinute+usable;
    for(const candidate of ordered){ if(!candidate.minutes||candidate.minutes<=0||candidate.minutes>maxBlock && candidate.minutes>window.endMinute-cursor) continue; if(candidate.minutes<minBlock && candidate.minutes<window.endMinute-cursor) continue; if(cursor+Math.min(candidate.minutes,maxBlock)>limit) continue; const duration=Math.min(candidate.minutes,maxBlock); blocks.push({id:`block_${candidate.id}_${cursor}`,title:candidate.title,kind:candidate.kind??"PRACTICE",startMinute:cursor,endMinute:cursor+duration,sourceTaskId:candidate.id}); cursor+=duration; if(cursor>=limit) break; }
  }
  const plannedIds=new Set(blocks.map(b=>b.sourceTaskId).filter(Boolean));
  for(const c of candidates) if(!plannedIds.has(c.id)) unscheduled.push(c);
  return {blocks,unscheduled};
}
