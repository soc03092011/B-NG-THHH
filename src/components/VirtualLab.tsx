import React, { useState, useEffect, useRef } from 'react';
import { LabReagent, LabReaction } from '../types/chemistry';
import { 
  FlaskConical, Flame, RotateCcw, Play, CheckCircle2, AlertTriangle, 
  Sparkles, Info, HelpCircle, Thermometer, Droplets, Eye, ShieldAlert, Award
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Reagent Library
export const REAGENTS: LabReagent[] = [
  // Axit
  { id: 'ch3cooh', nameVi: 'Giấm ăn (CH₃COOH 5%)', formula: 'CH₃COOH (dd)', category: 'acid', color: '#f8fafc', state: 'liquid', ph: 3.0, descriptionVi: 'Axit axetic loãng quen thuộc trong nhà bếp.' },
  { id: 'hcl', nameVi: 'Axit Clohiđric (HCl 1M)', formula: 'HCl (dd)', category: 'acid', color: '#f1f5f9', state: 'liquid', ph: 1.0, hazard: 'Ăn mòn', descriptionVi: 'Axit vô cơ mạnh, không màu, bốc khói nhẹ khi đặc.' },
  { id: 'h2so4', nameVi: 'Axit Sunfuric loãng', formula: 'H₂SO₄ (loãng)', category: 'acid', color: '#f8fafc', state: 'liquid', ph: 0.5, hazard: 'Ăn mòn mạnh', descriptionVi: 'Axit vô cơ 2 nấc mạnh hàng đầu công nghiệp.' },

  // Bazơ
  { id: 'naoh', nameVi: 'Natri Hiđroxit (NaOH 1M)', formula: 'NaOH (dd)', category: 'base', color: '#f8fafc', state: 'liquid', ph: 13.5, hazard: 'Ăn da', descriptionVi: 'Xút ăn da, kiềm mạnh làm nhờn da tay.' },
  { id: 'baoh2', nameVi: 'Bari Hiđroxit', formula: 'Ba(OH)₂ (dd)', category: 'base', color: '#f8fafc', state: 'liquid', ph: 12.5, descriptionVi: 'Dung dịch kiềm bari dùng nhận biết ion sunfat.' },
  { id: 'caoh2', nameVi: 'Nước vôi trong Ca(OH)₂', formula: 'Ca(OH)₂ (dd)', category: 'base', color: '#f8fafc', state: 'liquid', ph: 11.5, descriptionVi: 'Nước vôi trong vẩn đục khi sục khí CO₂.' },

  // Muối & Kim loại
  { id: 'nahco3', nameVi: 'Baking Soda (NaHCO₃)', formula: 'NaHCO₃ (rắn)', category: 'salt', color: '#ffffff', state: 'solid', ph: 8.3, descriptionVi: 'Bột nở màu trắng, muối axit của axit cacbonic yếu.' },
  { id: 'bacl2', nameVi: 'Bari Clorua (BaCl₂)', formula: 'BaCl₂ (dd)', category: 'salt', color: '#f8fafc', state: 'liquid', descriptionVi: 'Thuốc thử đặc trưng tạo kết tủa trắng với sunfat.' },
  { id: 'cuso4', nameVi: 'Đồng(II) Sunfat (CuSO₄)', formula: 'CuSO₄ (dd)', category: 'salt', color: '#0284c7', state: 'liquid', ph: 4.5, descriptionVi: 'Dung dịch có màu xanh lam óng ánh đặc trưng của Cu²⁺.' },
  { id: 'agno3', nameVi: 'Bạc Nitrat (AgNO₃)', formula: 'AgNO₃ (dd)', category: 'salt', color: '#f8fafc', state: 'liquid', descriptionVi: 'Thuốc thử nhạy nhận biết ion halogenua (Cl⁻).' },
  { id: 'nacl', nameVi: 'Muối ăn (NaCl 10%)', formula: 'NaCl (dd)', category: 'salt', color: '#f8fafc', state: 'liquid', ph: 7.0, descriptionVi: 'Muối trung hòa quen thuộc, không màu.' },
  { id: 'fe', nameVi: 'Đinh sắt (Fe)', formula: 'Fe (rắn)', category: 'metal', color: '#94a3b8', state: 'solid', descriptionVi: 'Kim loại màu xám, dẫn điện, có từ tính.' },
  { id: 'zn', nameVi: 'Kẽm hạt (Zn)', formula: 'Zn (rắn)', category: 'metal', color: '#cbd5e1', state: 'solid', descriptionVi: 'Hạt kim loại màu xám sáng, tan tốt trong axit.' },
  { id: 'mno2', nameVi: 'Mangan Đioxit (MnO₂)', formula: 'MnO₂ (rắn)', category: 'other', color: '#1e293b', state: 'solid', descriptionVi: 'Bột màu đen, chất xúc tác kinh điển phân hủy H₂O₂.' },
  { id: 'h2o2', nameVi: 'Oxi già (H₂O₂ 3%)', formula: 'H₂O₂ (dd)', category: 'other', color: '#f8fafc', state: 'liquid', descriptionVi: 'Dung dịch oxy già sát khuẩn, kém bền nhiệt.' },
  { id: 'h2o', nameVi: 'Nước cất (H₂O)', formula: 'H₂O (l)', category: 'other', color: '#f8fafc', state: 'liquid', ph: 7.0, descriptionVi: 'Nước nguyên chất độ tinh khiết cao, pH trung tính = 7.' },

  // Chỉ thị màu
  { id: 'phenolphthalein', nameVi: 'Chỉ thị Phenolphthalein', formula: 'C₂₀H₁₄O₄', category: 'indicator', color: '#fdf2f8', state: 'liquid', descriptionVi: 'Không màu trong axit và trung tính, hóa hồng cánh sen trong kiềm (pH > 8.3).' },
  { id: 'litmus', nameVi: 'Dung dịch Quỳ tím', formula: 'Litmus (dd)', category: 'indicator', color: '#a855f7', state: 'liquid', descriptionVi: 'Hóa đỏ trong axit, hóa xanh trong bazơ, tím ở trung tính.' },
];

// Pre-defined Chemical Reactions Engine
export const REACTIONS: LabReaction[] = [
  {
    id: 'baking-soda-vinegar',
    title: 'Phản ứng giữa Giấm ăn & Baking Soda',
    objective: 'Quan sát hiện tượng sủi bọt khí CO₂ mãnh liệt và phản ứng thu nhiệt nhẹ.',
    reagentIds: ['ch3cooh', 'nahco3'],
    balancedEquation: 'CH₃COOH (dd) + NaHCO₃ (r) -> CH₃COONa (dd) + CO₂↑ + H₂O (l)',
    phenomenon: 'Bột trắng NaHCO₃ tan dần, sủi bọt khí CO₂ dữ dội dâng trào trong ống nghiệm, thành cốc mát lạnh.',
    macroObservation: 'Bọt khí không màu sủi ào ạt, bọt trào lên miệng ống nghiệm. Khí CO₂ sinh ra dập tắt ngọn lửa.',
    microExplanation: 'Ion H⁺ từ axit axetic CH₃COOH chuyển sang ion bicacbonat HCO₃⁻ tạo thành axit cacbonic kém bền H₂CO₃. Axit này lập tức phân hủy thành phân tử nước H₂O và khí CO₂ thoát ra ngoài.',
    gasEvolved: 'CO₂ (Khí Cacbonic)',
    temperatureChange: '-3°C (Phản ứng thu nhiệt nhẹ)',
    safetyWarning: 'Phản ứng an toàn, nhưng chú ý khí CO₂ thoát nhanh có thể làm bắn dung dịch ra ngoài.',
    quizQuestion: {
      question: 'Khí thoát ra làm sủi bọt mạnh trong thí nghiệm giấm ăn và baking soda là khí gì?',
      options: ['Khí Oxy (O₂)', 'Khí Cacbonic (CO₂)', 'Khí Hiđrô (H₂)', 'Khí Nitơ (N₂)'],
      correctIndex: 1,
      explanation: 'Ion HCO₃⁻ nhận proton H⁺ tạo axit cacbonic kém bền phân hủy tức thì thành khí CO₂ và nước.',
    },
  },
  {
    id: 'zn-hcl',
    title: 'Kẽm tác dụng với Axit Clohiđric',
    objective: 'Khảo sát phản ứng thế của kim loại đứng trước hiđrô trong dãy hoạt động hóa học.',
    reagentIds: ['zn', 'hcl'],
    balancedEquation: 'Zn (r) + 2HCl (dd) -> ZnCl₂ (dd) + H₂↑',
    phenomenon: 'Hạt kẽm tan dần, bọt khí hiđrô H₂ không màu sủi bọt liên tục trên bề mặt hạt kẽm, ống nghiệm ấm lên.',
    macroObservation: 'Bọt khí li ti bám dày đặc trên hạt kẽm rồi bay lên. Khí H₂ thu được khi đốt kêu "tiếng nổ bốp" nhỏ đặc trưng.',
    microExplanation: 'Kẽm có thế khử chuẩn âm hơn hiđrô (-0.76V so với 0.00V), nguyên tử Zn nhường 2 electron cho 2 ion H⁺ để biến thành cation Zn²⁺ tan vào dung dịch, 2 ion H⁺ nhận electron tạo phân tử H₂.',
    gasEvolved: 'H₂ (Khí Hiđrô)',
    temperatureChange: '+8°C (Tỏa nhiệt)',
    safetyWarning: 'Khí H₂ dễ cháy nổ khi tiếp xúc với tia lửa hoặc ngọn lửa trần. Không để gần đèn cồn đang cháy.',
    quizQuestion: {
      question: 'Trong phản ứng giữa Zn và dung dịch HCl, nguyên tố nào đóng vai trò là chất khử?',
      options: ['Kẽm (Zn) vì số oxi hóa tăng từ 0 lên +2', 'Hiđrô (H) vì số oxi hóa tăng', 'Clo (Cl) vì số oxi hóa giảm', 'Nước (H₂O)'],
      correctIndex: 0,
      explanation: 'Kẽm nhường 2 electron để tạo Zn²⁺ (Zn⁰ -> Zn²⁺ + 2e), do đó Zn là chất khử.',
    },
  },
  {
    id: 'neutralization-phenolphthalein',
    title: 'Phản ứng trung hòa Axit - Bazơ (NaOH + HCl)',
    objective: 'Quan sát sự đổi màu của chất chỉ thị phenolphthalein khi phản ứng trung hòa đạt điểm tương đương.',
    reagentIds: ['naoh', 'hcl', 'phenolphthalein'],
    balancedEquation: 'NaOH (dd) + HCl (dd) -> NaCl (dd) + H₂O (l)',
    phenomenon: 'Dung dịch ban đầu có màu hồng tím đậm (do NaOH + phenolphthalein). Khi nhỏ HCl vào, màu hồng nhạt dần và mất màu hoàn toàn khi dung dịch đạt pH trung tính.',
    macroObservation: 'Màu hồng biến mất, dung dịch trở nên trong suốt không màu hoàn toàn, tỏa nhiệt ấm lòng bàn tay.',
    microExplanation: 'Ion H⁺ từ axit kết hợp với ion OH⁻ từ bazơ theo tỉ lệ mol 1:1 tạo thành phân tử nước: H⁺ + OH⁻ -> H₂O. Khi hết ion OH⁻ dư, phenolphthalein chuyển về dạng phân tử không màu.',
    colorChangeTo: '#ffffff',
    temperatureChange: '+6°C (Tỏa nhiệt)',
    safetyWarning: 'Axit HCl và kiềm NaOH đặc đều có tính ăn mòn da cao. Đeo kính bảo hộ và găng tay khi thao tác ngoài đời thực.',
    quizQuestion: {
      question: 'Dung dịch sau khi trung hòa hoàn toàn giữa lượng vừa đủ NaOH và HCl có pH xấp xỉ bằng bao nhiêu?',
      options: ['pH ≈ 1 (Axit mạnh)', 'pH ≈ 7 (Trung tính)', 'pH ≈ 14 (Kiềm mạnh)', 'pH ≈ 4'],
      correctIndex: 1,
      explanation: 'Sản phẩm tạo thành là muối trung hòa NaCl và nước H₂O, do đó dung dịch có môi trường trung tính với pH xấp xỉ 7.',
    },
  },
  {
    id: 'precipitation-baso4',
    title: 'Phản ứng tạo kết tủa trắng Bari Sunfat',
    objective: 'Khảo sát phản ứng trao đổi ion trong dung dịch tạo kết tủa trắng đặc trưng không tan trong axit.',
    reagentIds: ['bacl2', 'h2so4'],
    balancedEquation: 'BaCl₂ (dd) + H₂SO₄ (dd) -> BaSO₄↓ (trắng) + 2HCl (dd)',
    phenomenon: 'Ngay khi hai dung dịch trong suốt trộn vào nhau, xuất hiện kết tủa trắng mịn như sữa lập tức lắng xuống đáy ống nghiệm.',
    macroObservation: 'Dung dịch hóa đục trắng như sữa, sau đó chất rắn kết tủa trắng lắng xuống đáy ống nghiệm, không tan kể cả khi thêm axit HCl dư.',
    microExplanation: 'Lực hút tĩnh điện giữa ion Ba²⁺ và SO₄²⁻ tạo mạng tinh thể ion BaSO₄ có tích số tan cực nhỏ (Ksp ≈ 1.1 × 10⁻¹⁰), khiến chúng lập tức tách khỏi dung dịch dạng chất rắn.',
    precipitateColor: '#ffffff',
    safetyWarning: 'Muối bari hòa tan rất độc. Tuy nhiên kết tủa BaSO₄ không tan nên trơ sinh học (được ứng dụng làm chất cản quang X-quang).',
    quizQuestion: {
      question: 'Kết tủa BaSO₄ có tan trong dung dịch axit clohiđric (HCl) dư hay không?',
      options: ['Không tan trong axit HCl', 'Tan hoàn toàn sinh khí sủi bọt', 'Chuyển sang màu xanh lam', 'Tan một nửa'],
      correctIndex: 0,
      explanation: 'BaSO₄ là muối của axit mạnh H₂SO₄ và có độ tan cực kỳ thấp, không bị hòa tan bởi axit mạnh như HCl hay HNO₃.',
    },
  },
  {
    id: 'cu-oh2-precipitation',
    title: 'Phản ứng tạo kết tủa xanh Đồng(II) Hiđroxit',
    objective: 'Nhận biết ion đồng Cu²⁺ bằng dung dịch kiềm tạo kết tủa màu xanh lam.',
    reagentIds: ['cuso4', 'naoh'],
    balancedEquation: 'CuSO₄ (dd) + 2NaOH (dd) -> Cu(OH)₂↓ (xanh lam) + Na₂SO₄ (dd)',
    phenomenon: 'Xuất hiện kết tủa dạng keo màu xanh lam tuyệt đẹp lơ lửng trong ống nghiệm.',
    macroObservation: 'Dung dịch màu xanh lam trong suốt biến thành chất nhầy keo màu xanh da trời đậm lắng xuống.',
    microExplanation: 'Ion Cu²⁺ kết hợp với 2 ion OH⁻ tạo kết tủa bazơ không tan Cu(OH)₂. Nếu đun nóng bằng đèn cồn, kết tủa xanh sẽ phân hủy thành bột CuO màu đen.',
    precipitateColor: '#38bdf8',
    safetyWarning: 'Không nếm thử muối đồng vì gây độc tính đường tiêu hóa.',
    quizQuestion: {
      question: 'Nếu đem đun nóng kết tủa xanh Cu(OH)₂ trên ngọn lửa đèn cồn, hiện tượng gì sẽ xảy ra?',
      options: ['Kết tủa tan hoàn toàn thành dung dịch trong suốt', 'Kết tủa chuyển từ màu xanh sang màu đen (CuO)', 'Kết tủa chuyển sang màu đỏ gạch', 'Không có hiện tượng gì'],
      correctIndex: 1,
      explanation: 'Cu(OH)₂ kém bền nhiệt, bị nhiệt phân: Cu(OH)₂ -(t°)-> CuO (màu đen) + H₂O.',
    },
  },
  {
    id: 'fe-cuso4',
    title: 'Sắt đẩy Đồng ra khỏi dung dịch muối (Phản ứng ăn mòn điện hóa)',
    objective: 'Minh họa quy tắc kim loại mạnh đẩy kim loại yếu hơn ra khỏi dung dịch muối.',
    reagentIds: ['fe', 'cuso4'],
    balancedEquation: 'Fe (r) + CuSO₄ (dd) -> FeSO₄ (dd) + Cu↓ (bám trên đinh sắt)',
    phenomenon: 'Bề mặt đinh sắt xuất hiện một lớp đồng kim loại màu đỏ sáng bám chặt, dung dịch CuSO₄ màu xanh lam nhạt màu dần.',
    macroObservation: 'Lớp kim loại đỏ gạch óng ánh bao phủ đinh sắt xám. Dung dịch chuyển dần từ xanh lam sang màu xanh lá cây rất nhạt của ion Fe²⁺.',
    microExplanation: 'Sắt đứng trước đồng trong dãy điện hóa (E° Fe²⁺/Fe = -0.44V, Cu²⁺/Cu = +0.34V). Sắt nhường electron cho ion Cu²⁺ trong dung dịch, nguyên tử Cu giải phóng kết tinh bám lên thanh sắt.',
    precipitateColor: '#ea580c',
    safetyWarning: 'Sau thí nghiệm, rửa sạch tay và dụng cụ.',
    quizQuestion: {
      question: 'Phản ứng giữa Fe và CuSO₄ thuộc loại phản ứng hóa học nào?',
      options: ['Phản ứng phân hủy', 'Phản ứng thế (Oxi hóa - Khử)', 'Phản ứng trung hòa', 'Phản ứng trùng hợp'],
      correctIndex: 1,
      explanation: 'Đây là phản ứng thế điển hình của kim loại trong hóa học vô cơ.',
    },
  },
  {
    id: 'h2o2-mno2-catalyst',
    title: 'Phân hủy Oxi già có xúc tác Mangan Đioxit',
    objective: 'Khảo sát tác dụng của chất xúc tác làm tăng tốc độ phản ứng phân hủy hóa học.',
    reagentIds: ['h2o2', 'mno2'],
    balancedEquation: '2H₂O₂ (dd) -(MnO₂)-> 2H₂O (l) + O₂↑',
    phenomenon: 'Ngay khi cho một lượng nhỏ bột đen MnO₂ vào dung dịch oxi già, khí O₂ sủi bọt cuồn cuộn như sôi trào, tỏa nhiều nhiệt.',
    macroObservation: 'Khí oxy sinh ra ào ạt làm bùng cháy que đóm còn tàn đỏ. Bột MnO₂ không bị tiêu hao sau phản ứng.',
    microExplanation: 'MnO₂ làm giảm năng lượng hoạt hóa của phản ứng phân hủy H₂O₂, giúp hàng triệu phân tử H₂O₂ phân rã trong một giây mà bản thân MnO₂ không bị biến đổi hóa học.',
    gasEvolved: 'O₂ (Khí Oxy)',
    temperatureChange: '+14°C (Tỏa nhiệt mạnh)',
    safetyWarning: 'Khí oxy nồng độ cao kích thích sự cháy dữ dội. Oxi già bắn vào da gây đốm trắng do oxy hóa mô.',
    quizQuestion: {
      question: 'Vai trò của bột màu đen MnO₂ trong phản ứng này là gì?',
      options: ['Chất tham gia phản ứng chính', 'Chất xúc tác làm tăng tốc độ phản ứng', 'Chất kìm hãm phản ứng', 'Dung môi hòa tan'],
      correctIndex: 1,
      explanation: 'MnO₂ là chất xúc tác, nó tham gia vào các giai đoạn trung gian nhưng được tái tạo nguyên vẹn sau phản ứng.',
    },
  },
  {
    id: 'agcl-precipitation',
    title: 'Nhận biết ion Cl⁻ bằng dung dịch Bạc Nitrat',
    objective: 'Quan sát phản ứng tạo kết tủa trắng AgCl - phản ứng định tính kinh điển.',
    reagentIds: ['agno3', 'nacl'],
    balancedEquation: 'AgNO₃ (dd) + NaCl (dd) -> AgCl↓ (trắng) + NaNO₃ (dd)',
    phenomenon: 'Xuất hiện kết tủa trắng vón cục AgCl tức thì. Để ngoài ánh sáng một lúc, kết tủa chuyển dần sang màu xám đen.',
    macroObservation: 'Chất kết tủa trắng sữa xuất hiện tức thì trong dung dịch trong suốt.',
    microExplanation: 'Ag⁺ và Cl⁻ kết hợp tạo AgCl không tan. Dưới tác dụng của ánh sáng, AgCl bị quang phân giải phóng bạc kim loại mịn màu đen: 2AgCl -(ánh sáng)-> 2Ag↓ + Cl₂.',
    precipitateColor: '#ffffff',
    safetyWarning: 'Dung dịch AgNO₃ dính vào da tay sẽ biến thành vết ố đen do giải phóng hạt nano bạc, vài ngày sau mới hết.',
    quizQuestion: {
      question: 'Tại sao kết tủa AgCl để ngoài ánh sáng một thời gian lại chuyển dần sang màu xám đen?',
      options: ['Do hấp thụ oxy trong không khí', 'Do bị phân hủy quang hóa giải phóng hạt bạc kim loại màu đen (Ag)', 'Do bốc hơi clo', 'Do hòa tan lại'],
      correctIndex: 1,
      explanation: 'AgCl nhạy sáng và bị quang phân hủy tạo thành hạt nano bạc kim loại màu xám đen.',
    },
  },
  {
    id: 'litmus-hcl',
    title: 'Thử độ axit của dung dịch bằng Quỳ tím',
    objective: 'Quan sát sự đổi màu của giấy quỳ / dung dịch quỳ tím trong môi trường axit.',
    reagentIds: ['hcl', 'litmus'],
    balancedEquation: 'H⁺ (dd) + In⁻ (tím) -> HIn (màu đỏ)',
    phenomenon: 'Dung dịch quỳ tím lập tức chuyển từ màu tím biếc sang màu đỏ tươi rực rỡ.',
    macroObservation: 'Dung dịch đổi sang màu đỏ rực rỡ, pH < 7.',
    microExplanation: 'Dung dịch axit có nồng độ ion H⁺ cao (pH ≈ 1). Dạng axit của phẩm màu quỳ tím (HIn) phát xạ màu đỏ.',
    colorChangeTo: '#ef4444',
    safetyWarning: 'Axit ăn mòn da và vải quần áo.',
    quizQuestion: {
      question: 'Khi nhỏ dung dịch axit HCl vào quỳ tím, quỳ tím chuyển sang màu gì?',
      options: ['Màu xanh lam', 'Màu đỏ', 'Màu vàng', 'Không đổi màu'],
      correctIndex: 1,
      explanation: 'Dung dịch có tính axit (pH < 7) làm quỳ tím chuyển sang màu đỏ.',
    },
  },
  {
    id: 'litmus-naoh',
    title: 'Thử độ kiềm của dung dịch bằng Quỳ tím',
    objective: 'Quan sát sự đổi màu của chất chỉ thị trong môi trường bazơ.',
    reagentIds: ['naoh', 'litmus'],
    balancedEquation: 'OH⁻ (dd) + HIn (đỏ/tím) -> In⁻ (màu xanh lam) + H₂O',
    phenomenon: 'Dung dịch quỳ tím lập tức chuyển từ màu tím sang màu xanh lam đậm.',
    macroObservation: 'Dung dịch chuyển sang màu xanh lam đậm, pH > 7.',
    microExplanation: 'Ion OH⁻ từ kiềm kéo proton khỏi phân tử chỉ thị, đưa phân tử về dạng anion In⁻ có màu xanh lam.',
    colorChangeTo: '#2563eb',
    safetyWarning: 'Kiềm NaOH có tính ăn da nhờn, tránh tiếp xúc trực tiếp.',
    quizQuestion: {
      question: 'Dung dịch NaOH làm quỳ tím chuyển sang màu gì?',
      options: ['Màu đỏ', 'Màu xanh', 'Màu tím', 'Màu vàng'],
      correctIndex: 1,
      explanation: 'Dung dịch có tính kiềm/bazơ (pH > 7) làm quỳ tím chuyển sang màu xanh.',
    },
  },
];

export const VirtualLab: React.FC = () => {
  const [selectedReagentIds, setSelectedReagentIds] = useState<string[]>([]);
  const [vesselType, setVesselType] = useState<'tube' | 'beaker' | 'flask'>('tube');
  const [burnerOn, setBurnerOn] = useState<boolean>(false);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [activeReaction, setActiveReaction] = useState<LabReaction | null>(null);
  const [unreactiveExplanation, setUnreactiveExplanation] = useState<string | null>(null);
  const [selectedQuizAnswer, setSelectedQuizAnswer] = useState<number | null>(null);
  const [showQuizResult, setShowQuizResult] = useState<boolean>(false);

  // Selected guided experiment from library
  const [guidedExperimentId, setGuidedExperimentId] = useState<string>('');

  const bubbleContainerRef = useRef<HTMLDivElement>(null);

  // Reagents currently in the vessel
  const vesselReagents = selectedReagentIds
    .map((id) => REAGENTS.find((r) => r.id === id))
    .filter(Boolean) as LabReagent[];

  // Helper to trigger reaction
  const handlePerformReaction = () => {
    setIsReacting(true);
    setUnreactiveExplanation(null);
    setSelectedQuizAnswer(null);
    setShowQuizResult(false);

    // Check if any defined reaction matches selected reagents
    const matched = REACTIONS.find((rxn) => {
      // Must contain all required reagents
      const hasAllRequired = rxn.reagentIds.every((reqId) => selectedReagentIds.includes(reqId));
      return hasAllRequired;
    });

    if (matched) {
      setActiveReaction(matched);
      // Trigger confetti celebration if student successfully formed a reaction!
      setTimeout(() => {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#06b6d4', '#3b82f6', '#10b981'],
        });
      }, 700);
    } else {
      setActiveReaction(null);
      if (selectedReagentIds.length < 2) {
        setUnreactiveExplanation('Cần tối thiểu 2 hóa chất để khảo sát tương tác hóa học!');
      } else {
        setUnreactiveExplanation(
          'Trong điều kiện mô phỏng hiện tại, các hóa chất được chọn không tạo thành phản ứng hóa học (không có hiện tượng trao đổi ion tạo kết tủa, khí bay lên, đổi màu chỉ thị hay phản ứng oxi hóa - khử).'
        );
      }
    }
  };

  const handleResetLab = () => {
    setSelectedReagentIds([]);
    setActiveReaction(null);
    setUnreactiveExplanation(null);
    setIsReacting(false);
    setBurnerOn(false);
    setSelectedQuizAnswer(null);
    setShowQuizResult(false);
  };

  const handleLoadGuided = (rxnId: string) => {
    setGuidedExperimentId(rxnId);
    const target = REACTIONS.find((r) => r.id === rxnId);
    if (target) {
      setSelectedReagentIds(target.reagentIds);
      setActiveReaction(target);
      setIsReacting(true);
      setUnreactiveExplanation(null);
      setSelectedQuizAnswer(null);
      setShowQuizResult(false);
    }
  };

  const toggleReagent = (id: string) => {
    if (selectedReagentIds.includes(id)) {
      setSelectedReagentIds(selectedReagentIds.filter((item) => item !== id));
      setActiveReaction(null);
      setIsReacting(false);
    } else {
      if (selectedReagentIds.length >= 4) return; // Limit 4 max
      setSelectedReagentIds([...selectedReagentIds, id]);
      setActiveReaction(null);
      setIsReacting(false);
    }
  };

  // Determine liquid fill color inside the glassware
  const getLiquidColor = () => {
    if (activeReaction?.colorChangeTo) {
      return activeReaction.colorChangeTo;
    }
    // Indicator logic
    if (selectedReagentIds.includes('phenolphthalein') && (selectedReagentIds.includes('naoh') || selectedReagentIds.includes('baoh2'))) {
      return '#f43f5e'; // Deep pink
    }
    if (selectedReagentIds.includes('litmus')) {
      if (selectedReagentIds.includes('hcl') || selectedReagentIds.includes('h2so4') || selectedReagentIds.includes('ch3cooh')) {
        return '#ef4444'; // Red
      }
      if (selectedReagentIds.includes('naoh') || selectedReagentIds.includes('baoh2')) {
        return '#2563eb'; // Blue
      }
      return '#8b5cf6'; // Purple
    }
    if (selectedReagentIds.includes('cuso4')) {
      return '#0ea5e9'; // Blue copper solution
    }
    return '#e2e8f0'; // Clean liquid/water default
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Top Banner: Virtual Lab Intro & Guided Experiment Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <FlaskConical className="w-4 h-4" />
            <span>Phòng Nghiên Cứu Khoa Học Tương Tác Ảo</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Phòng Thí Nghiệm Hóa Học Ảo An Toàn</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Mô phỏng chân thực các phản ứng hóa học vô cơ, axit-bazơ, kết tủa và khí thoát ra dựa trên dữ liệu khoa học thực nghiệm.
          </p>
        </div>

        {/* Guided Experiments Dropdown */}
        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-400 whitespace-nowrap">Chọn bài mẫu:</span>
          <select
            value={guidedExperimentId}
            onChange={(e) => handleLoadGuided(e.target.value)}
            className="w-full md:w-64 bg-slate-950 text-slate-200 border border-slate-700 text-xs rounded-xl px-3 py-2 outline-none focus:border-cyan-500 cursor-pointer font-medium"
          >
            <option value="">-- Khám phá tự do --</option>
            {REACTIONS.map((rxn) => (
              <option key={rxn.id} value={rxn.id}>
                {rxn.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Lab Working Area: Left Shelves | Center Glassware Bench | Right Reaction Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Reagent Shelf (4 Cols) */}
        <div className="lg:col-span-4 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide">
              Kệ Hóa Chất Phòng Thí Nghiệm
            </span>
            <span className="text-[11px] text-cyan-400 font-mono">
              Đã chọn: {selectedReagentIds.length}/4
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[520px] overflow-y-auto pr-1">
            {REAGENTS.map((reagent) => {
              const isSelected = selectedReagentIds.includes(reagent.id);
              return (
                <div
                  key={reagent.id}
                  onClick={() => toggleReagent(reagent.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500 text-white shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full border border-white/20 shrink-0"
                      style={{ backgroundColor: reagent.color }}
                    />
                    <div>
                      <div className="text-xs font-semibold flex items-center gap-1.5">
                        <span>{reagent.nameVi}</span>
                        {reagent.hazard && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                            {reagent.hazard}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono text-cyan-400">{reagent.formula}</span>
                    </div>
                  </div>

                  <button
                    className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center transition ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {isSelected ? '✓' : '+'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center Column: The Virtual Glassware Bench (5 Cols) */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col justify-between items-center relative min-h-[500px]">
          
          {/* Top Bench Controls */}
          <div className="w-full flex items-center justify-between z-10">
            {/* Vessel Switch */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setVesselType('tube')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  vesselType === 'tube' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Ống nghiệm
              </button>
              <button
                onClick={() => setVesselType('beaker')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  vesselType === 'beaker' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Cốc thủy tinh
              </button>
              <button
                onClick={() => setVesselType('flask')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  vesselType === 'flask' ? 'bg-cyan-600 text-white font-medium' : 'text-slate-400 hover:text-white'
                }`}
              >
                Bình tam giác
              </button>
            </div>

            {/* Burner Toggle */}
            <button
              onClick={() => setBurnerOn(!burnerOn)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs transition ${
                burnerOn
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-lg shadow-amber-500/20 font-bold'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <Flame className={`w-4 h-4 ${burnerOn ? 'text-amber-400 fill-amber-400' : ''}`} />
              <span>{burnerOn ? 'Đèn cồn BẬT' : 'Bật đèn cồn'}</span>
            </button>
          </div>

          {/* Center Glassware Simulation Rendering */}
          <div className="relative my-auto flex flex-col items-center justify-end w-64 h-80">
            {/* Gas Bubbles Animation Container */}
            {isReacting && activeReaction?.gasEvolved && (
              <div 
                ref={bubbleContainerRef}
                className="absolute top-8 w-40 h-32 overflow-hidden pointer-events-none flex justify-center"
              >
                <div className="relative w-full h-full">
                  {/* Procedural Rising Bubbles */}
                  {[...Array(12)].map((_, i) => (
                    <span
                      key={i}
                      className="absolute rounded-full bg-cyan-300/60 border border-white animate-bounce"
                      style={{
                        width: `${6 + (i % 4) * 3}px`,
                        height: `${6 + (i % 4) * 3}px`,
                        left: `${20 + (i * 18) % 65}%`,
                        bottom: `${(i * 15) % 100}%`,
                        animationDuration: `${0.8 + (i % 5) * 0.2}s`,
                      }}
                    />
                  ))}
                  <div className="absolute top-1 text-center w-full text-[11px] font-mono text-cyan-300 font-bold animate-pulse">
                    {activeReaction.gasEvolved} ↑
                  </div>
                </div>
              </div>
            )}

            {/* Glassware Vessel Graphics */}
            <div className="relative flex flex-col items-center">
              {/* Glass Rim */}
              <div
                className={`border-2 border-slate-400/80 rounded-t-lg bg-white/5 backdrop-blur-[1px] relative shadow-inner transition-all ${
                  vesselType === 'tube'
                    ? 'w-16 h-56 rounded-b-full'
                    : vesselType === 'beaker'
                    ? 'w-40 h-52 rounded-b-xl border-t-0'
                    : 'w-48 h-56 [clip-path:polygon(30%_0%,70%_0%,100%_100%,0%_100%)] rounded-b-2xl'
                }`}
              >
                {/* Liquid Inside */}
                {selectedReagentIds.length > 0 && (
                  <div
                    className="absolute bottom-0 w-full transition-all duration-700 ease-out overflow-hidden flex flex-col justify-end"
                    style={{
                      height: `${Math.min(80, selectedReagentIds.length * 25)}%`,
                      backgroundColor: getLiquidColor(),
                      opacity: 0.85,
                      borderBottomLeftRadius: vesselType === 'tube' ? '9999px' : '0.75rem',
                      borderBottomRightRadius: vesselType === 'tube' ? '9999px' : '0.75rem',
                    }}
                  >
                    {/* Precipitate layer at bottom if active reaction generates precipitate */}
                    {isReacting && activeReaction?.precipitateColor && (
                      <div
                        className="w-full h-8 rounded-b-xl transition-all duration-1000 shadow-lg"
                        style={{ backgroundColor: activeReaction.precipitateColor }}
                        title={`Kết tủa: ${activeReaction.balancedEquation.split('->')[1]}`}
                      />
                    )}
                  </div>
                )}

                {/* Glass Measurement Tick Marks */}
                <div className="absolute left-1 top-6 bottom-6 flex flex-col justify-between text-[8px] font-mono text-slate-400/50 pointer-events-none select-none">
                  <span>- 100ml</span>
                  <span>- 75ml</span>
                  <span>- 50ml</span>
                  <span>- 25ml</span>
                </div>
              </div>

              {/* Bunsen Burner Flame Base */}
              {burnerOn && (
                <div className="flex flex-col items-center mt-1 animate-pulse">
                  <div className="w-8 h-10 bg-gradient-to-t from-blue-600 via-amber-400 to-transparent rounded-full blur-[2px]" />
                  <div className="w-12 h-3 bg-slate-700 rounded-md" />
                </div>
              )}
            </div>
          </div>

          {/* Bottom Action Triggers */}
          <div className="w-full flex items-center justify-between gap-3 pt-4 border-t border-slate-800/80 z-10">
            <button
              onClick={handleResetLab}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Rửa sạch dụng cụ</span>
            </button>

            <button
              onClick={handlePerformReaction}
              disabled={selectedReagentIds.length === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-lg ${
                selectedReagentIds.length > 0
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-cyan-500/25 cursor-pointer scale-105'
                  : 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Tiến hành phản ứng</span>
            </button>
          </div>
        </div>

        {/* Right Column: Reaction Results, Micro Explanation & Post-Lab Quiz (3 Cols) */}
        <div className="lg:col-span-3 bg-slate-900/80 border border-slate-800 rounded-3xl p-4 shadow-xl flex flex-col gap-4 overflow-y-auto max-h-[620px]">
          
          <div className="pb-2 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-cyan-400" />
              <span>Nhật Ký Quan Sát</span>
            </span>
            {activeReaction?.temperatureChange && (
              <span className="text-[11px] font-mono text-amber-300 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" />
                <span>{activeReaction.temperatureChange}</span>
              </span>
            )}
          </div>

          {/* Active Reaction Output Card */}
          {activeReaction ? (
            <div className="flex flex-col gap-4 text-xs">
              <div>
                <span className="text-cyan-400 font-bold block">{activeReaction.title}</span>
                <p className="text-slate-400 text-[11px] mt-0.5">{activeReaction.objective}</p>
              </div>

              {/* Balanced Equation */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Phương trình hóa học cân bằng:
                </span>
                <span className="font-mono text-emerald-300 font-bold text-xs break-words">
                  {activeReaction.balancedEquation}
                </span>
              </div>

              {/* Phenomenon */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                  Hiện tượng quan sát:
                </span>
                <p className="text-slate-200 leading-relaxed text-[11px]">
                  {activeReaction.phenomenon}
                </p>
              </div>

              {/* Micro Explanation */}
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex flex-col gap-1">
                <span className="text-[10px] text-cyan-500 uppercase font-bold tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bản chất phân tử & ion:</span>
                </span>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  {activeReaction.microExplanation}
                </p>
              </div>

              {/* Safety Warning */}
              <div className="bg-rose-950/20 p-2.5 rounded-xl border border-rose-900/30 text-[11px] text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                <span>{activeReaction.safetyWarning}</span>
              </div>

              {/* Post-Lab Quiz Box */}
              {activeReaction.quizQuestion && (
                <div className="bg-slate-950 p-3.5 rounded-2xl border border-indigo-500/40 flex flex-col gap-2.5">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                    <HelpCircle className="w-4 h-4" />
                    <span>Câu hỏi củng cố sau thí nghiệm:</span>
                  </div>
                  <p className="text-slate-200 text-xs font-medium">
                    {activeReaction.quizQuestion.question}
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {activeReaction.quizQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedQuizAnswer(idx);
                          setShowQuizResult(true);
                        }}
                        className={`text-left p-2 rounded-xl text-xs transition border ${
                          selectedQuizAnswer === idx
                            ? idx === activeReaction.quizQuestion?.correctIndex
                              ? 'bg-emerald-600/30 border-emerald-500 text-emerald-200 font-medium'
                              : 'bg-rose-600/30 border-rose-500 text-rose-200 font-medium'
                            : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>

                  {showQuizResult && (
                    <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 mt-1">
                      {selectedQuizAnswer === activeReaction.quizQuestion.correctIndex ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Chính xác!
                        </span>
                      ) : (
                        <span className="text-rose-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Chưa chính xác.
                        </span>
                      )}
                      <p className="mt-1 text-slate-400">{activeReaction.quizQuestion.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : unreactiveExplanation ? (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-900/40 text-amber-200 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-amber-300">
                <AlertTriangle className="w-4 h-4" />
                <span>Không phát hiện phản ứng</span>
              </div>
              <p className="leading-relaxed text-[11px] text-amber-200/90">
                {unreactiveExplanation}
              </p>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
              <FlaskConical className="w-8 h-8 text-slate-700" />
              <span>Hãy chọn 2 hoặc nhiều hóa chất ở kệ bên trái, sau đó nhấn "Tiến hành phản ứng".</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
