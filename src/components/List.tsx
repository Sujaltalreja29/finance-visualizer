import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function List() {
  const [transactions, setTransactions] = useState([]);
  console.log(transactions)
  // Fetch transactions on component mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await axios.get('/api/get-transaction');
        setTransactions(response.data.data); // Assuming response data contains the list
      } catch (error) {
        console.error(error);
      }
    };

    fetchTransactions();
  }, []); // Empty dependency array ensures it runs only once

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    const id = e.currentTarget.dataset.id;
    if (!id) return;

    // try {
    //   await axios.delete(`/api/delete-transaction/${id}`);
    //   // Update transactions after deletion
    //   setTransactions((prev) => prev.filter((t) => t._id !== id));
    // } catch (error) {
    //   console.error('Error deleting transaction:', error);
    // }
  };


    
    return (
      transactions.map((transaction) => {
      <div
        className="item flex justify-center bg-gray-50 py-2 rounded-r"
        style={{ borderRight: `8px solid ${transaction['color'] ?? '#e5e5e5'}` }}
      >
        <button
          className="px-3 text-black"
          data-id={transaction['_id'] ?? ''}
          onClick={handleClick}
        >
          🗑️
        </button>
        <span className="block w-full">
          {transaction['name']} - {transaction['amount']}
        </span>
      </div>
      })
    );
}

// function Transaction({category, handler}: any) {
//   if (!category) return null;

  
// }
