let db;

const request = indexedDB.open('budget', 1);

request.onupgradeneeded = function(event) {
  const db = event.target.result;
  db.createObjectStore('new_trans', { autoIncrement: true });
};

request.onsuccess = function(event) {
  db = event.target.result;

  if (navigator.onLine) {
    uploadTrans();
    };
  };

  request.onerror = function(event) {
    console.log(event.target.errorCode);
  };
  
  function saveRecord(record) {

    const transaction = db.transaction(['new_trans'], 'readwrite');
    const budgetObjectStore = transaction.objectStore('new_trans');

    budgetObjectStore.add(record);
  };

function uploadTrans() {
  const transaction = db.transaction(['new_trans'], 'readwrite');
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function() {
    if (getAll.result.legnth > 0) {
      fetch(`api/transaction`, {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        }
      })
      .then(response => response.json())
      .then(serverResponse => {
        if (serverResponse.message) {
          throw new Error(serverResponse.message);
        }

        const transaction = db.transaction(['new_trans'], 'readwrite');
        const budgetObjectStore = transaction.objectStore('new_trans');
        budgetObjectStore.clear();

        alert('All offline transactions have been synced to database');
      });
    }
  }
};

window.addEventListener('online', uploadTrans);