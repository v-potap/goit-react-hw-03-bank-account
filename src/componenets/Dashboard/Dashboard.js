import React, { Component } from 'react';
import uuidv4 from 'uuid';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Controls from '../Controls/Controls';
import Balance from '../Balance/Balance';
import TransactionHistory from '../TransactionHistory/TransactionHistory';

import styles from './Dashboard.module.css';

import TransactionType from '../../services/transaction-type';

const INITIAL_STATE = {
  transactions: [],
  balance: 0,
};

export default class Dashboard extends Component {
  constructor(props) {
    super(props);

    if (localStorage.hasOwnProperty('transactions')) {
      const transactions = JSON.parse(localStorage.getItem('transactions'));

      this.state = {
        transactions,
        balance: transactions.reduce(
          (total, tr) =>
            total + tr.amount * (tr.type === TransactionType.DEPOSIT ? 1 : -1),
          0,
        ),
      };
    } else {
      this.state = {
        ...INITIAL_STATE,
      };
    }
  }

  componentDidUpdate() {
    const { transactions } = this.state;
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }

  addTransaction = inputTransaction => {
    const { type, amount } = inputTransaction;
    const { transactions, balance } = this.state;

    if (amount <= 0) {
      toast.warn(
        'Введите корректную сумму для проведения операции (положительное число) !',
        {
          autoClose: 7000,
        },
      );
      return;
    }

    if (amount > balance && type === TransactionType.WITHDRAW) {
      toast.error('На счету недостаточно средств для проведения операции!', {
        autoClose: 10000,
      });
      return;
    }

    this.setState({
      transactions: [
        ...transactions,
        {
          id: uuidv4(),
          type,
          amount,
          date: new Date().toLocaleString(),
        },
      ],
      balance: balance + amount * (type === TransactionType.DEPOSIT ? 1 : -1),
    });
  };

  totalize(transactionType) {
    const { transactions } = this.state;

    return transactions
      .filter(({ type }) => type === transactionType)
      .reduce((total, tr) => total + tr.amount, 0);
  }

  render() {
    const { transactions, balance } = this.state;
    return (
      <div className={styles.dashboard}>
        <Controls handleTransactionAdd={this.addTransaction} />
        <Balance
          depositAmount={this.totalize(TransactionType.DEPOSIT)}
          withdrawAmount={this.totalize(TransactionType.WITHDRAW)}
          balance={balance}
        />
        <TransactionHistory transactions={transactions} />
        <ToastContainer />
      </div>
    );
  }
}
