import PocketBase from 'pocketbase';

const pocketbaseUrl = process.env.NEXT_PUBLIC_POCKETBASE_URL;

export const client = new PocketBase(pocketbaseUrl);
