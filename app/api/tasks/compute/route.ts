import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { pert, difficultyScore, mbtiEff } from '@/lib/compute';

export async function POST(req: Request){
  const { inputs_json } = await req.json();
  const { target_years, weekly_hours, mbti } = inputs_json;

  // 3言語：英B2→C1 / 中A1→B2 / 韓A0→A2 を参照クラスから取得
  const pairs = [['B2','C1'], ['A1','B2'], ['A0','A2']];
  let total = 0;
  for(const [from,to] of pairs){
    const { data, error } = await supabase
      .from('reference_classes')
      .select('hours_min,hours_mode,hours_max')
      .eq('task_type','language').eq('from_level',from).eq('to_level',to).maybeSingle();
    if(error || !data) return NextResponse.json({error:`ref not found ${from}->${to}`}, {status:400});
    total += pert(data.hours_min, data.hours_mode, data.hours_max);
  }
  // 並行ペナルティ＆MBTI補正
  const hours = total * (1/0.8) / mbtiEff(mbti);
  const yearly = (weekly_hours||10)*52;
  const years = hours / (yearly||1);
  const p50 = Math.max(0.4, 1 - Math.max(0, (years - target_years) / (target_years*0.8)));
  const p80 = Math.max(0.2, p50 - 0.15);

  const out = {
    difficulty: difficultyScore(),
    p50_prob: Math.round(p50*100),
    p80_prob: Math.round(p80*100),
    hours_min: Math.round(hours*0.85),
    hours_max: Math.round(hours*1.15),
    weekly_hours, target_years,
    sections: {
      intro: `## サマリー\n- 難易度: ${difficultyScore()}/10\n- 達成確率（${target_years}年以内）: P50=${Math.round(p50*100)}%, P80=${Math.round(p80*100)}%\n- 想定総時間: 約${Math.round(hours*0.85)}〜${Math.round(hours*1.15)}h（週${weekly_hours}h想定）`,
      risks: `## リスク & ボトルネック\n- 同時学習の効率低下（20〜40%）\n- 中級→上級の出力の壁`,
      roadmap: `## ロードマップ\n- 0〜6ヶ月：基礎定着\n- 7〜18ヶ月：中級ブースト\n- 19〜36ヶ月：運用域へ`,
      routine: `## 週次ルーティン\n- 平日1.5h/日＋週末2h×2`,
      first_step: `## 最初の一歩（MBTI）\n${mbti ? `タイプ ${mbti} 向け：学習ブロックを6週分カレンダー固定` : '本日やる：学習時間を6週分予約'}`,
      materials: `## 教材/方法\n- シャドー→要約→語彙抽出\n- 録音→自己レビュー`,
      checklist: `## 週次チェック\n- 合計10h / 録音5本 / 要約2本 / 作文4本`
    }
  };

  return NextResponse.json({ task: { outputs_json: out }});
}
