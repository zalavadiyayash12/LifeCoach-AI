import { useState, useEffect } from 'react';

export const useUserData = (dataType) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('lifeCoach_userUid');

  // Data Fetch
  useEffect(() => {
    fetch(`http://localhost:5000/api/user/data/${userId}`)
      .then(res => res.json())
      .then(result => {
        setData(result[dataType] || []);
        setLoading(false);
      });
  }, [dataType, userId]);

  // Data Save
  const saveData = async (newData) => {
    setData(newData);
    await fetch('http://localhost:5000/api/user/update-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, dataType, dataValue: newData })
    });
  };

  return { data, setData, saveData, loading };
};