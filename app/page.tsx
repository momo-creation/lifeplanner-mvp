'use client';
import { useState } from 'react';

export default function Home(){
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState<any>(null);

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">人生設計計算機（MVP）</h1>

      <form onSubmit={async (e:any)=>{
        e.preventDefault(); setLoading(true);
        const form = new FormData(e.currentTarget);
        const body = {
          type:'language',
          title:'3年で3言語マスター',
          inputs_json:{
            target_years:Number(form.get('target_years')||3),
            weekly_hours:Number(form.get('weekly_hours')||10),
            mbti:String(form.get('mbti')||'')
          }
        };
        const res = await fetch('/api/tasks/compute', {method:'POST', body:JSON.stringify(body)});
        const json = await res.json(); setTask(json.task); setLoading(false);
      }} className="space-y-3">
        <div><label className="block text-sm">希望年数</label>
          <input name="target_years" defaultValue={3} type="number" step="0.5" className="border p-2 w-40"/></div>
        <div><label className="block text-sm">週あたり時間</label>
          <input name="weekly_hours" defaultValue={10} type="number" step="1" className="border p-2 w-40"/></div>
        <div><label className="block text-sm">MBTI（任意）</label>
          <input name="mbti" placeholder="ISTJ など" className="border p-2 w-40"/></div>
        <button disabled={loading} className="bg-black text-white px-4 py-2 rounded">{loading?'計算中...':'結果を生成'}</button>
      </form>

      {task && (
        <section className="mt-8 space-y-4">
          <h2 className="text-xl font-semibold">A4プレビュー</h2>
          {Object.values(task.outputs_json.sections).map((s:any, i:number)=>(
            <div key={i} className="border rounded p-3 whitespace-pre-wrap bg-gray-50">{String(s)}</div>
          ))}
        </section>
      )}
    </main>
  );
}
