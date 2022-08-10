// @ts-ignore
import ListResult from 'pocketbase/models/utils/ListResult';
import styles from '../styles/Share.module.css';
import { Record } from 'pocketbase';
import { client } from '../utils/pocketbaseClient';
import { useEffect, useRef, useState } from 'react';

export default function Share() {
  const [posts, setPosts] = useState<ListResult<Record>>();
  const collectionName = 'posts';
  const fileInput = useRef(null);

  const handleUpdate = async () => {
    const resultList = await client.records.getList(collectionName);
    setPosts(resultList);
  };

  const readablizeBytes = bytes => {
    const units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const e = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / (1024 ** e)).toFixed(2)} ${units[e]}`;
  };

  useEffect(() => {
    handleUpdate();

    const listener = async () => {
      for (const file of fileInput.current.files) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('name', file.name);
        formData.append('size', file.size);
        formData.append('type', file.type);
        await client.records.create(collectionName, formData);
      }

      handleUpdate();
    };

    const type = 'change';
    fileInput.current.addEventListener(type, listener);

    return () => {
      fileInput.current.removeEventListener(type, listener);
    };
  }, []);
  return (
    <div>
      <input
        multiple
        ref={fileInput}
        type="file"
      />
      {posts
        ? posts.items.length !== 0
          ? (
            <table className={styles.records}>
              <thead>
                <tr>
                  <th className={styles.header__name}>Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {posts.items.map(item => (
                  <tr key={item.id}>
                    <td className={styles.field__name}>
                      <a
                        download={item.name}
                        href={client.records.getFileUrl(item, item.file)}
                      >{item.name}</a>
                    </td>
                    <td className={styles.field__size}>{readablizeBytes(item.size)}</td>
                    <td>
                      <code>{item.type}</code>
                    </td>
                    <td className={styles.field__created}>{item.created}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
          : (
            <div>No items</div>
          )
        : (
          <div>Syncing</div>
        )}
    </div>
  );
}
