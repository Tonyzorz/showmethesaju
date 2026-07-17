/** Language-neutral glossary metadata. Names and definitions live in locale JSON. */
export interface Term {
  key: string;
  hanja: string;
  roman: string;
}

export const TERMS: Term[] = [
  { key: 'saju', hanja: '四柱', roman: 'saju' },
  { key: 'palja', hanja: '八字', roman: 'palja' },
  { key: 'ilgan', hanja: '日干', roman: 'ilgan' },
  { key: 'ohaeng', hanja: '五行', roman: 'ohaeng' },
  { key: 'cheongan', hanja: '天干', roman: 'cheongan' },
  { key: 'jiji', hanja: '地支', roman: 'jiji' },
  { key: 'sipseong', hanja: '十星', roman: 'sipseong' },
  { key: 'gunghap', hanja: '宮合', roman: 'gunghap' },
  { key: 'manseryeok', hanja: '萬歲曆', roman: 'manseryeok' },
  { key: 'jinTaeyangsi', hanja: '地方平均太陽時', roman: 'local solar time' },
  { key: 'ipchun', hanja: '立春', roman: 'ipchun' },
  { key: 'daeun', hanja: '大運', roman: 'daeun' },
  { key: 'taewon', hanja: '胎元', roman: 'taewon' },
  { key: 'myeonggung', hanja: '命宮', roman: 'myeonggung' },
  { key: 'singang', hanja: '身强·身弱', roman: 'singang · sinyak' },
  { key: 'yongsin', hanja: '用神', roman: 'yongsin' },
  { key: 'gyeokguk', hanja: '格局', roman: 'gyeokguk' },
  { key: 'samjae', hanja: '三災', roman: 'samjae' },
  { key: 'johu', hanja: '調候', roman: 'johu' },
];
