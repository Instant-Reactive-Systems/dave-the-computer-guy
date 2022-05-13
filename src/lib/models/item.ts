export type ItemType = 'outfit' | 'deskSetup' | 'TV-setup' | 'bed' | 'wardrobeCloset' | 'poster'

export type Item = {
    id: number;
    name: string;
    type: ItemType;
    url: string;
    owned: boolean;
    cost: number;
    boundingBox: {
        x: number,
        y: number,
        z: number   
    }
}