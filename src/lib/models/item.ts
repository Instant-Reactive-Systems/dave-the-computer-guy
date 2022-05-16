export type ItemType = 'bed' | 'cabinet' | 'chair' | 'couch' | 'desk' |
 'extra-large-desk' | 'large-desk' | 'pc' | 'trashcan' | 'tv' | 'wall-decoration';

export type Item = {
    id: number;
    name: string;
    type: ItemType;
    url: string;
    imageUrl: string;
    owned: boolean;
    cost: number;
}