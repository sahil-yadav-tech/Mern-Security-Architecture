// function Bank(name, phone, accountType, balance) {
//   this.name = name;
//   this.phone = phone;
//   this.accountType = accountType;
//   this.balance = balance;
//   this.deposit = (amount) => {
//     this.balance += amount;
//     console.log(`Deposited ${amount}. New balance: ${this.balance}`);
//   }
// }
// const user1 = new Bank("Sahil", "1234567890", "Savings", 1000);
// console.log(user1.balance);
// user1.deposit(500);
// console.log(user1.balance);
// console.log(user1);


class Bank {
    constructor(name, phone, accountType, balance) {
        this.name = name;
        this.phone = phone;
        this.accountType = accountType;
        this.balance = balance;
    }
}

const user1 = new Bank("Sahil", "1234567890", "Savings", 1000);
console.log(user1.balance);