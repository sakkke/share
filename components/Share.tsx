// @ts-ignore
import ListResult from 'pocketbase/models/utils/ListResult';
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
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Size</th>
                  <th>Type</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {posts.items.map(item => (
                  <tr key={item.id}>
                    <td>
                      <a
                        download={item.name}
                        href={client.records.getFileUrl(item, item.file)}
                      >{item.name}</a>
                    </td>
                    <td>{item.size}</td>
                    <td>{item.type}</td>
                    <td>{item.created}</td>
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
