export type RefClass = { hours_min:number; hours_mode:number; hours_max:number; };
export function pert(a:number,m:number,b:number){ return (a+4*m+b)/6; }
export function difficultyScore(){ return 8.0; } // MVP固定
export function mbtiEff(mbti?:string){ return ({ISTJ:1.05,ENFP:0.9,INTP:0.95,ENTJ:1.0}[mbti||'']||1.0); }
