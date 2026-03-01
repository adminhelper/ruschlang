export const REGION_OPTIONS = [
  '지역 전체', '서울', '경기', '부산', '대구', '인천', '광주',
  '대전', '울산', '세종', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주',
] as const;

export const FOOD_CATEGORY_OPTIONS = [
  '음식종류 전체', '한식', '중식', '일식', '양식',
  '카페/디저트', '분식', '치킨', '피자', '기타',
] as const;

export const GRADE_FILTER_OPTIONS = [
  '평점 전체', '5스타', '4스타', '3스타', '뉴비',
] as const;

const FOOD_KEYWORDS: Record<string, string[]> = {
  '한식': ['한식', '한정식', '설렁탕', '삼겹살', '김치', '갈비', '냉면', '비빔', '찌개', '국밥', '불고기', '보쌈', '족발'],
  '중식': ['중식', '중국', '짜장', '짬뽕', '탕수육', '마라', '양꼬치'],
  '일식': ['일식', '초밥', '스시', '라멘', '우동', '돈카츠', '사시미', '이자카야', '오마카세'],
  '양식': ['양식', '파스타', '피자', '스테이크', '버거', '브런치', '이탈리안', '프렌치'],
  '카페/디저트': ['카페', '커피', '디저트', '베이커리', '빵', '케이크', '아이스크림', '마카롱'],
  '분식': ['분식', '떡볶이', '김밥', '튀김', '순대', '라볶이'],
  '치킨': ['치킨', '닭', '통닭', '후라이드', '양념치킨'],
  '피자': ['피자'],
};

export function inferFoodCategory(name: string, description: string, category: string = ''): string {
  const text = `${name} ${description} ${category}`.toLowerCase();
  for (const [cat, keywords] of Object.entries(FOOD_KEYWORDS)) {
    if (keywords.some(kw => text.includes(kw))) return cat;
  }
  return '기타';
}

export function matchesRegion(region: string, filter: string): boolean {
  if (filter === '지역 전체') return true;
  return region.includes(filter);
}

export function matchesFoodCategory(name: string, description: string, category: string = '', filter: string): boolean {
  if (filter === '음식종류 전체') return true;
  return inferFoodCategory(name, description, category) === filter;
}

export function matchesGradeFilter(grade: string, filter: string): boolean {
  if (filter === '평점 전체') return true;
  const gradeMap: Record<string, string> = {
    '5스타': '5star', '4스타': '4star', '3스타': '3star', '뉴비': 'newbie',
  };
  return grade === gradeMap[filter];
}
