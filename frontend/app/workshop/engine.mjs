export const JOBS = [
 {id:'fan',name:'Quạt của cô Lan',pay:70,due:3,parts:1,story:'Cô Lan cần quạt mở quán sáng mai. Giao đúng hẹn sẽ có khách giới thiệu.'},
 {id:'radio',name:'Radio của bác Minh',pay:90,due:5,parts:1,story:'Trong radio có mảnh giấy ghi nét chữ của cha. Bác Minh muốn nhận lại trước chiều ngày 2.'},
 {id:'fridge',name:'Tủ mát quán nước',pay:230,due:6,parts:2,story:'Đơn giới thiệu từ cô Lan. Cần bàn nghề nâng cấp; bạn có thể thương lượng ứng tiền.'}
];
export function fresh(){return {version:1,slot:0,cash:50,parts:2,energy:3,trust:0,father:0,tool:false,help:false,advance:false,promise:false,promiseDone:false,letter:false,ended:false,jobs:{fan:0,radio:0,fridge:0},log:['Ngày 1 · Còn hai ngày để góp 240 đồng tiền thuê. Cha muốn giúp, nhưng đang cần nghỉ.']};}
export function actions(s){
 if(s.ended)return [];
 const a=[]; const add=(id,label,detail,ok=true)=>a.push({id,label,detail,ok});
 for(const j of JOBS){if(j.id==='fridge'&&s.trust<1)continue;const p=s.jobs[j.id];if(p===0)add('inspect:'+j.id,'Chẩn đoán · '+j.name,'1 buổi · tìm đúng lỗi, mở phương án sửa.');if(p===1){add('repair:'+j.id,'Tự sửa · '+j.name,`1 buổi · ${j.parts} linh kiện · 1 sức${j.id==='fridge'?' · cần bàn nghề':''}`,s.parts>=j.parts&&s.energy>=1&&(j.id!=='fridge'||s.tool));add('help:'+j.id,'Nhờ cha · '+j.name,`1 buổi · ${j.parts} linh kiện · cha mệt hơn, không mất sức`,s.parts>=j.parts&&!s.help);}if(p===2)add('deliver:'+j.id,'Bàn giao · '+j.name,`Không tốn buổi · nhận ${s.slot>j.due?Math.floor(j.pay*.7):j.pay} đồng${s.slot>j.due?' (trễ hẹn −30%)':''}`);}
 add('parts','Mua linh kiện','1 buổi · 35 đồng → 2 linh kiện',s.cash>=35);
 add('rest','Nghỉ và ăn cùng cha','1 buổi · hồi 2 sức, cha bớt mệt');
 add('tool','Nâng cấp bàn nghề','1 buổi · 60 đồng · mở đơn tủ mát',!s.tool&&s.cash>=60);
 add('friend','Gặp bạn cũ','1 buổi · nhận 40 đồng, hứa giúp bạn vào ngày 2',!s.promise);
 add('promise','Giúp bạn chuyển đồ','1 buổi · ngày 2 · giữ lời hứa',s.promise&&!s.promiseDone&&s.slot>=3);
 add('visit','Hỏi cha về lá thư','1 buổi · mở câu chuyện gia đình và hỗ trợ 30 đồng',s.letter&&!s.visited);
 add('deposit','Xin ứng tiền đơn tủ mát','Không tốn buổi · nhận 50 đồng; trừ vào tiền công',s.trust>=1&&!s.advance&&s.jobs.fridge<3);
 return a;
}
export function act(state,id){
 const found=available(state).find(a=>a.id===id&&a.ok);if(!found)throw Error('Hành động chưa khả dụng.');
 const s=structuredClone(state);const [type,key]=id.split(':');let msg=found.label;let spend=true;
 if(type==='inspect')s.jobs[key]=1;
 else if(type==='repair'||type==='help'){const j=JOBS.find(j=>j.id===key);s.parts-=j.parts;s.jobs[key]=2;if(type==='help'){s.help=true;s.father+=2;}else s.energy--;if(key==='radio')s.letter=true;}
 else if(type==='deliver'){const j=JOBS.find(j=>j.id===key);s.cash+=Math.max(0,(s.slot>j.due?Math.floor(j.pay*.7):j.pay)-(key==='fridge'&&s.advance?50:0));s.jobs[key]=3;if(key==='fan'&&s.slot<=j.due){s.trust++;msg+=' · Cô Lan giới thiệu đơn tủ mát!';}spend=false;}
 else if(id==='parts'){s.cash-=35;s.parts+=2;}
 else if(id==='rest'){s.energy=Math.min(3,s.energy+2);s.father=Math.max(0,s.father-1);}
 else if(id==='tool'){s.cash-=60;s.tool=true;}
 else if(id==='friend'){s.cash+=40;s.promise=true;}
 else if(id==='promise'){s.promiseDone=true;s.trust++;}
 else if(id==='visit'){s.cash+=30;s.visited=true;msg+=' · Cha kể về người từng giúp mình giữ tiệm.';}
 else if(id==='deposit'){s.cash+=50;s.advance=true;spend=false;}
 s.log.push(`Ngày ${Math.floor(s.slot/3)+1} · ${msg}`);
 if(spend)s.slot++;
 // Deliver finished work at the final evening rather than silently losing its reward.
 if(s.slot===6&&!Object.values(s.jobs).includes(2))s.ended=true;
 if(s.slot===6&&spend)s.log.push('Hết hai ngày. Bạn vẫn có thể bàn giao các món đã sửa trước khi kết toán.');
 if(s.slot>=6){s.slot=6;if(!Object.values(s.jobs).includes(2))s.ended=true;}
 return s;
}
export function available(s){return actions(s).filter(a=>s.slot<6||a.id.startsWith('deliver:'));}
export function ending(s){return s.cash>=240?'Đủ tiền giữ tiệm':s.trust>0||s.promiseDone?'Chưa đủ tiền, còn người đồng hành':'Thiếu tiền, cần thương lượng lại';}
export function valid(s){return !!s&&s.version===1&&Number.isInteger(s.slot)&&s.slot>=0&&s.slot<=6&&['cash','parts','energy','trust','father'].every(k=>Number.isFinite(s[k])&&s[k]>=0)&&typeof s.ended==='boolean'&&Array.isArray(s.log)&&s.log.every(x=>typeof x==='string')&&JOBS.every(j=>Number.isInteger(s.jobs?.[j.id])&&s.jobs[j.id]>=0&&s.jobs[j.id]<=3);}
