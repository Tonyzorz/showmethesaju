/** Source of truth for tooltip + /glossary page. def.* falls back to en. */
export interface Term {
  key: string; hanja: string; roman: string;
  name: { en: string; ko: string };
  def: { en: string; ko: string };
}
export const TERMS: Term[] = [
  { key: 'saju', hanja: '四柱', roman: 'saju',
    name: { en: 'Saju (Four Pillars)', ko: '사주' },
    def: { en: 'Korea\'s traditional destiny-reading system. Your birth year, month, day, and hour each form a "pillar" of two characters — eight in total.', ko: '태어난 연·월·일·시 네 기둥으로 운명의 흐름을 읽는 한국의 전통 명리 체계입니다.' } },
  { key: 'palja', hanja: '八字', roman: 'palja',
    name: { en: 'Palja (Eight Characters)', ko: '팔자' },
    def: { en: 'The eight characters that make up your four pillars. "Palja" is also everyday Korean for one\'s lot in life.', ko: '네 기둥을 이루는 여덟 글자. 일상에서 "팔자"는 타고난 운명을 뜻하기도 합니다.' } },
  { key: 'ilgan', hanja: '日干', roman: 'ilgan',
    name: { en: 'Day Master', ko: '일간' },
    def: { en: 'The heavenly stem of your day pillar — the character that represents you. All other parts of the chart are read in relation to it.', ko: '일주의 천간으로, 사주에서 "나"를 나타내는 글자입니다. 모든 해석의 기준점입니다.' } },
  { key: 'ohaeng', hanja: '五行', roman: 'ohaeng',
    name: { en: 'Five Elements', ko: '오행' },
    def: { en: 'Wood, fire, earth, metal, and water — the five energies whose balance in your chart shapes temperament and tendencies.', ko: '목·화·토·금·수 다섯 기운. 사주 안의 균형이 기질과 성향을 만듭니다.' } },
  { key: 'cheongan', hanja: '天干', roman: 'cheongan',
    name: { en: 'Heavenly Stems', ko: '천간' },
    def: { en: 'The ten characters (甲 to 癸) that form the top half of each pillar, each carrying an element and a yin/yang polarity.', ko: '갑(甲)부터 계(癸)까지 열 글자로, 각 기둥의 윗글자입니다.' } },
  { key: 'jiji', hanja: '地支', roman: 'jiji',
    name: { en: 'Earthly Branches', ko: '지지' },
    def: { en: 'The twelve characters (子 to 亥) forming the bottom half of each pillar — the same cycle behind the twelve zodiac animals.', ko: '자(子)부터 해(亥)까지 열두 글자로, 각 기둥의 아랫글자이자 띠의 바탕입니다.' } },
  { key: 'sipseong', hanja: '十星', roman: 'sipseong',
    name: { en: 'Ten Gods', ko: '십성' },
    def: { en: 'Ten relationship types between your Day Master and the other characters — the grammar that turns a chart into a reading about wealth, career, relationships, and drive.', ko: '일간과 다른 글자들 사이의 열 가지 관계. 재물·직업·관계·성향 해석의 문법입니다.' } },
  { key: 'gunghap', hanja: '宮合', roman: 'gunghap',
    name: { en: 'Gunghap (Compatibility)', ko: '궁합' },
    def: { en: 'Compatibility reading between two charts. Traditionally checked before marriage in Korea — still common today.', ko: '두 사람의 사주로 보는 어울림. 혼인 전 궁합을 보는 전통은 지금도 이어집니다.' } },
  { key: 'manseryeok', hanja: '萬歲曆', roman: 'manseryeok',
    name: { en: 'Manseryeok (Perpetual Calendar)', ko: '만세력' },
    def: { en: 'The perpetual calendar used to derive the pillars from a birth moment. We compute it astronomically in your browser.', ko: '생년월일시로 사주를 뽑는 달력. 이 사이트는 브라우저에서 천문 계산으로 산출합니다.' } },
  { key: 'jinTaeyangsi', hanja: '眞太陽時', roman: 'jin-taeyangsi',
    name: { en: 'True Solar Time', ko: '진태양시' },
    def: { en: 'Clock time corrected for your birthplace\'s longitude. In Seoul the sun runs about 32 minutes behind the clock.', ko: '출생지 경도에 맞춰 보정한 시간. 서울은 표준시보다 약 32분 늦습니다.' } },
  { key: 'ipchun', hanja: '立春', roman: 'ipchun',
    name: { en: 'Ipchun (Start of Spring)', ko: '입춘' },
    def: { en: 'The solar term (around Feb 4) when the saju year changes — not January 1st. Births in January belong to the previous saju year.', ko: '사주의 해가 바뀌는 절기(2월 4일경). 1월생은 전년도 사주 해에 속합니다.' } },
  { key: 'daeun', hanja: '大運', roman: 'daeun',
    name: { en: 'Daeun (Ten-Year Luck Cycles)', ko: '대운' },
    def: { en: 'Ten-year phases of life read from your chart — the timing layer of saju. Coming to this site in a future update.', ko: '10년 단위의 인생 흐름. 사주의 "타이밍" 해석 영역으로, 추후 업데이트 예정입니다.' } },
];
