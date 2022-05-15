export type ItemType = 'outfit' | 'deskSetup' | 'TV-setup' | 'bed' | 'wardrobeCloset' | 'poster'

export type Item = {
    id: number;
    name: string;
    type: ItemType;
    url: string;
    imageUrl: string;
    owned: boolean;
    cost: number;
}