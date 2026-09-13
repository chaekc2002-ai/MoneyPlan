export interface TreehouseItem {
  id: string;
  name: string;
  cost: number;
  category: 'furniture' | 'decoration' | 'wallpaper';
  imagePlaceholder?: string;
  x: number;
  y: number;
}

export const ITEMS: TreehouseItem[] = [
  { id: 'item_1', name: '기본 침대', cost: 10, category: 'furniture', x: 20, y: 70 },
  { id: 'item_2', name: '나뭇잎 러그', cost: 12, category: 'decoration', x: 40, y: 85 },
  { id: 'item_3', name: '버섯 스탠드', cost: 15, category: 'furniture', x: 10, y: 65 },
  { id: 'item_4', name: '도토리 모양 창문', cost: 20, category: 'decoration', x: 40, y: 20 },
  { id: 'item_5', name: '통나무 테이블', cost: 18, category: 'furniture', x: 60, y: 75 },
  { id: 'item_6', name: '나뭇가지 의자', cost: 10, category: 'furniture', x: 75, y: 75 },
  { id: 'item_7', name: '미니 책장', cost: 25, category: 'furniture', x: 80, y: 50 },
  { id: 'item_8', name: '별똥별 모빌', cost: 30, category: 'decoration', x: 50, y: 10 },
  { id: 'item_9', name: '따뜻한 난로', cost: 28, category: 'furniture', x: 30, y: 70 },
  { id: 'item_10', name: '호박 램프', cost: 15, category: 'decoration', x: 25, y: 65 },
  { id: 'item_11', name: '부드러운 쿠션', cost: 10, category: 'decoration', x: 20, y: 75 },
  { id: 'item_12', name: '넝쿨 장식', cost: 14, category: 'decoration', x: 10, y: 10 },
  { id: 'item_13', name: '해바라기 화분', cost: 16, category: 'decoration', x: 5, y: 80 },
  { id: 'item_14', name: '작은 솔방울 시계', cost: 20, category: 'decoration', x: 80, y: 20 },
  { id: 'item_15', name: '캠프파이어 랜턴', cost: 22, category: 'furniture', x: 50, y: 85 },
  { id: 'item_16', name: '이끼 낀 거울', cost: 24, category: 'furniture', x: 90, y: 60 },
  { id: 'item_17', name: '달팽이 저금통', cost: 10, category: 'decoration', x: 65, y: 70 },
  { id: 'item_18', name: '낙엽 커튼', cost: 25, category: 'decoration', x: 40, y: 15 },
  { id: 'item_19', name: '둥지 모양 의자', cost: 30, category: 'furniture', x: 60, y: 80 },
  { id: 'item_20', name: '반딧불이 병', cost: 15, category: 'decoration', x: 85, y: 40 },
  { id: 'item_21', name: '나무뿌리 옷걸이', cost: 18, category: 'furniture', x: 15, y: 50 },
  { id: 'item_22', name: '미니 식탁보', cost: 12, category: 'decoration', x: 60, y: 73 },
  { id: 'item_23', name: '솔잎 빗자루', cost: 10, category: 'decoration', x: 5, y: 90 },
  { id: 'item_24', name: '거미줄 해먹', cost: 30, category: 'furniture', x: 40, y: 40 },
  { id: 'item_25', name: '나무껍질 벽지', cost: 28, category: 'wallpaper', x: 0, y: 0 },
  { id: 'item_26', name: '산딸기 샹들리에', cost: 30, category: 'decoration', x: 50, y: 0 },
  { id: 'item_27', name: '잣방울 오디오', cost: 25, category: 'furniture', x: 70, y: 75 },
  { id: 'item_28', name: '꽃가루 방향제', cost: 10, category: 'decoration', x: 65, y: 65 },
  { id: 'item_29', name: '꿀단지', cost: 15, category: 'decoration', x: 15, y: 85 },
  { id: 'item_30', name: '마법의 씨앗', cost: 30, category: 'decoration', x: 90, y: 85 },
];
