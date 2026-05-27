export type Topic = 
  | 'Window Functions'
  | 'Joins'
  | 'Aggregation'
  | 'Subqueries'
  | 'Recursive CTE'
  | 'String Functions'
  | 'Date Functions'
  | 'DML'
  | 'CASE & Logic';

export interface Question {
  id: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  schema: string;
  setupSql: string;
  solutionSql: string;
  hints?: string[];
  company?: string;
  topic: Topic;
}

export const questions: Question[] = [
  {
    id: 'q1',
    difficulty: 'Easy',
    title: 'Cumulative Revenue',
    description: 'Write a query to calculate the daily revenue and the running cumulative revenue per day from the `sales` table.',
    schema: `TABLE sales (
  order_date DATE,
  revenue INTEGER
)`,
    setupSql: `
      DROP TABLE IF EXISTS sales;
      CREATE TABLE sales (
        order_date DATE,
        revenue INTEGER
      );
      INSERT INTO sales (order_date, revenue) VALUES
      ('2023-01-01', 100), ('2023-01-01', 150),
      ('2023-01-02', 200),
      ('2023-01-03', 50), ('2023-01-03', 300),
      ('2023-01-04', 120), ('2023-01-04', 80),
      ('2023-01-05', 450),
      ('2023-01-06', 90), ('2023-01-06', 110), ('2023-01-06', 50),
      ('2023-01-07', 300),
      ('2023-01-08', 150), ('2023-01-08', 250),
      ('2023-01-09', 180),
      ('2023-01-10', 220), ('2023-01-10', 130),
      ('2023-01-11', 400),
      ('2023-01-12', 310), ('2023-01-12', 90),
      ('2023-01-13', 150),
      ('2023-01-14', 500);
    `,
    solutionSql: `SELECT 
  order_date, 
  SUM(revenue) AS daily_revenue, 
  SUM(SUM(revenue)) OVER (ORDER BY order_date) AS cumulative_revenue 
FROM sales 
GROUP BY order_date 
ORDER BY order_date;`,
    company: 'Amazon',
    topic: 'Window Functions',
    hints: [
      'You will need to use an aggregate function combined with a window function.',
      'Think about how you can SUM() the daily SUM() of revenue.',
      'The OVER() clause should order by the order_date to compute the running total.'
    ]
  },
  {
    id: 'q2',
    difficulty: 'Easy',
    title: 'Finding Duplicates',
    description: 'Find duplicate records in a transactional table and safely delete the extras, keeping only the first one based on ID.',
    schema: `TABLE transactions (
  id INTEGER PRIMARY KEY,
  user_id INTEGER,
  txn_time TIMESTAMP,
  amount INTEGER
)`,
    setupSql: `
      DROP TABLE IF EXISTS transactions;
      CREATE TABLE transactions (
        id INTEGER PRIMARY KEY,
        user_id INTEGER,
        txn_time TIMESTAMP,
        amount INTEGER
      );
      INSERT INTO transactions (id, user_id, txn_time, amount) VALUES
      (1, 101, '2023-01-01 10:00:00', 50),
      (2, 101, '2023-01-01 10:00:00', 50), -- Duplicate
      (3, 102, '2023-01-01 11:00:00', 75),
      (4, 103, '2023-01-02 09:00:00', 100),
      (5, 103, '2023-01-02 09:00:00', 100), -- Duplicate
      (6, 104, '2023-01-02 10:00:00', 120),
      (7, 105, '2023-01-03 14:00:00', 200),
      (8, 105, '2023-01-03 14:00:00', 200), -- Duplicate
      (9, 105, '2023-01-03 14:00:00', 200), -- Duplicate
      (10, 106, '2023-01-04 08:30:00', 45),
      (11, 107, '2023-01-04 15:45:00', 300),
      (12, 108, '2023-01-05 11:15:00', 150),
      (13, 108, '2023-01-05 11:15:00', 150), -- Duplicate
      (14, 109, '2023-01-05 16:00:00', 85),
      (15, 110, '2023-01-06 09:00:00', 60),
      (16, 110, '2023-01-06 09:00:00', 60), -- Duplicate
      (17, 111, '2023-01-06 13:00:00', 95),
      (18, 112, '2023-01-07 10:00:00', 110),
      (19, 112, '2023-01-07 10:00:00', 110), -- Duplicate
      (20, 113, '2023-01-07 17:30:00', 400),
      (21, 114, '2023-01-08 12:00:00', 250);
    `,
    solutionSql: `WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id, txn_time, amount ORDER BY id) AS rn
  FROM transactions
)
DELETE FROM transactions 
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
-- To verify, run: SELECT * FROM transactions ORDER BY id;`,
    company: 'Google',
    topic: 'DML',
    hints: [
      'Since you need to keep the first record based on ID, think about assigning a row number to duplicates.',
      'Use the ROW_NUMBER() window function partitioned by the duplicate-defining columns.',
      'Delete the rows where the assigned row number is greater than 1.'
    ]
  },
  {
    id: 'q3',
    difficulty: 'Easy',
    title: 'Product Sales Rank',
    description: 'Rank products by sales per year, resetting the rank each year.',
    schema: `TABLE product_sales (
  product_id INTEGER,
  sale_date DATE,
  amount INTEGER
)`,
    setupSql: `
      DROP TABLE IF EXISTS product_sales;
      CREATE TABLE product_sales (
        product_id INTEGER,
        sale_date DATE,
        amount INTEGER
      );
      INSERT INTO product_sales (product_id, sale_date, amount) VALUES
      (1, '2022-05-10', 500),
      (2, '2022-08-15', 800),
      (1, '2022-12-01', 200),
      (1, '2023-02-10', 300),
      (2, '2023-06-20', 100),
      (3, '2023-09-11', 600),
      (3, '2022-04-15', 400),
      (4, '2022-07-20', 1500),
      (2, '2022-10-05', 300),
      (5, '2022-11-12', 700),
      (4, '2023-01-18', 900),
      (5, '2023-03-25', 1200),
      (1, '2023-05-05', 400),
      (2, '2023-07-14', 600),
      (3, '2023-08-08', 250),
      (6, '2022-09-09', 1100),
      (6, '2023-04-02', 850),
      (7, '2023-06-11', 500),
      (7, '2022-12-15', 950),
      (8, '2022-08-22', 350),
      (8, '2023-10-10', 750);
    `,
    solutionSql: `WITH yearly_sales AS (
  SELECT 
    product_id, 
    EXTRACT(YEAR FROM sale_date) AS sale_year, 
    SUM(amount) AS total_sales
  FROM product_sales
  GROUP BY product_id, sale_year
)
SELECT 
  *, 
  RANK() OVER (PARTITION BY sale_year ORDER BY total_sales DESC) AS sales_rank
FROM yearly_sales;`,
    company: 'Meta',
    topic: 'Window Functions',
    hints: [
      'First, you need to aggregate the total sales for each product per year. Consider using a CTE or subquery.',
      'Extract the year from the sale_date using EXTRACT(YEAR FROM ...).',
      'Finally, use the RANK() window function partitioned by the year to rank the aggregated sales.'
    ]
  },
  {
    id: 'q4',
    difficulty: 'Easy',
    title: 'Same Day Transactions',
    description: 'Identify customers whose first and last transaction occurred on the exact same day.',
    schema: `TABLE customer_txns (
  customer_id INTEGER,
  transaction_date TIMESTAMP
)`,
    setupSql: `
      DROP TABLE IF EXISTS customer_txns;
      CREATE TABLE customer_txns (
        customer_id INTEGER,
        transaction_date TIMESTAMP
      );
      INSERT INTO customer_txns (customer_id, transaction_date) VALUES
      (1, '2023-01-01 10:00:00'),
      (1, '2023-01-01 15:00:00'),
      (2, '2023-01-01 09:00:00'),
      (2, '2023-01-02 11:00:00'),
      (3, '2023-05-10 14:00:00'),
      (4, '2023-01-03 08:00:00'),
      (4, '2023-01-03 12:00:00'),
      (4, '2023-01-03 19:30:00'),
      (5, '2023-01-04 10:00:00'),
      (5, '2023-01-05 14:00:00'),
      (6, '2023-01-06 09:15:00'),
      (6, '2023-01-06 18:45:00'),
      (7, '2023-01-07 11:00:00'),
      (8, '2023-01-08 08:30:00'),
      (8, '2023-01-08 23:59:00'),
      (9, '2023-01-09 13:00:00'),
      (9, '2023-01-10 10:00:00'),
      (9, '2023-01-11 15:00:00'),
      (10, '2023-01-12 12:00:00'),
      (10, '2023-01-12 17:00:00'),
      (11, '2023-01-13 09:00:00'),
      (11, '2023-01-13 22:00:00'),
      (12, '2023-01-14 14:30:00'),
      (12, '2023-01-15 16:30:00');
    `,
    solutionSql: `SELECT customer_id
FROM customer_txns
GROUP BY customer_id
HAVING DATE(MIN(transaction_date)) = DATE(MAX(transaction_date));`,
    company: 'Uber',
    topic: 'Aggregation',
    hints: [
      'You need to evaluate each customer as a group, so GROUP BY customer_id is a good start.',
      'Think about how you can compare the very first and very last transaction for a customer.',
      'The HAVING clause lets you filter groups where the DATE() of the MIN transaction matches the MAX transaction.'
    ]
  },
  {
    id: 'q5',
    difficulty: 'Medium',
    title: 'Median Salary',
    description: 'Find the median salary of employees in each department. If there is an even number of employees, the median is the average of the two middle salaries. Return the result ordered by DepartmentId.',
    schema: `TABLE Employee (
  Id INTEGER,
  DepartmentId INTEGER,
  Salary INTEGER
)`,
    setupSql: `
      DROP TABLE IF EXISTS Employee;
      CREATE TABLE Employee (
          Id INT,
          DepartmentId INT,
          Salary INT
      );
      INSERT INTO Employee (Id, DepartmentId, Salary) VALUES
      (1, 10, 5000), (2, 10, 6000), (3, 10, 7000), (4, 10, 8000), (5, 10, 9000),
      (6, 20, 4000), (7, 20, 5000), (8, 20, 6000), (9, 20, 8000),
      (10, 30, 4500), (11, 30, 5500), (12, 30, 6500), (13, 30, 7500), (14, 30, 8500), (15, 30, 9500),
      (16, 10, 5500), (17, 10, 6500), (18, 10, 7500),
      (19, 20, 4500), (20, 20, 5500), (21, 20, 7000), (22, 20, 9000),
      (23, 30, 5000), (24, 30, 6000);
    `,
    solutionSql: `WITH RankedSalaries AS (
  SELECT 
    DepartmentId,
    Salary,
    ROW_NUMBER() OVER (PARTITION BY DepartmentId ORDER BY Salary ASC, Id ASC) AS rn_asc,
    ROW_NUMBER() OVER (PARTITION BY DepartmentId ORDER BY Salary DESC, Id DESC) AS rn_desc
  FROM Employee
)
SELECT 
  DepartmentId,
  ROUND(AVG(Salary), 2) AS MedianSalary
FROM RankedSalaries
WHERE rn_asc = rn_desc 
   OR rn_asc + 1 = rn_desc 
   OR rn_asc - 1 = rn_desc
GROUP BY DepartmentId
ORDER BY DepartmentId;`,
    company: 'Amazon',
    topic: 'Window Functions',
    hints: [
      'To find the median, assign row numbers ascending and descending within each department.',
      'A row is part of the median if its ascending rank is equal to its descending rank, or differs by exactly 1.',
      'Average the salaries of those matching rows grouped by DepartmentId.'
    ]
  },
  {
    id: 'q6',
    difficulty: 'Medium',
    title: 'Login Streaks',
    description: 'Find all users who have logged in for at least 3 consecutive days. Return the result ordered by user_id.',
    schema: `TABLE logins (
  user_id INTEGER,
  login_date DATE
)`,
    setupSql: `
      DROP TABLE IF EXISTS logins;
      CREATE TABLE logins (
          user_id INT,
          login_date DATE
      );
      INSERT INTO logins (user_id, login_date) VALUES
      (101, '2023-10-01'), (101, '2023-10-02'), (101, '2023-10-03'), (101, '2023-10-05'),
      (102, '2023-10-01'), (102, '2023-10-02'), (102, '2023-10-04'), (102, '2023-10-05'),
      (103, '2023-10-05'), (103, '2023-10-06'), (103, '2023-10-07'), (103, '2023-10-08'),
      (104, '2023-10-01'), (104, '2023-10-03'), (104, '2023-10-05'), (104, '2023-10-07'),
      (101, '2023-10-10'), (101, '2023-10-11'), (101, '2023-10-12'), (101, '2023-10-13'),
      (102, '2023-10-10'), (102, '2023-10-11'), (102, '2023-10-15'), (102, '2023-10-16');
    `,
    solutionSql: `WITH DistinctLogins AS (
  SELECT DISTINCT user_id, login_date
  FROM logins
),
GroupedLogins AS (
  SELECT 
    user_id,
    login_date,
    login_date - CAST(ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY login_date) AS INT) as grp_date
  FROM DistinctLogins
)
SELECT DISTINCT user_id
FROM GroupedLogins
GROUP BY user_id, grp_date
HAVING COUNT(*) >= 3
ORDER BY user_id;`,
    company: 'Uber',
    topic: 'Window Functions',
    hints: [
      'Think about using the Islands and Gaps technique.',
      'If you subtract a sequential ROW_NUMBER() from a consecutive date sequence, the resulting date will be identical for the whole streak.',
      'Group by the user and this calculated baseline date, then filter where the count of logins is at least 3.'
    ]
  },
  {
    id: 'q7',
    difficulty: 'Medium',
    title: '7-Day Rolling Average',
    description: 'Calculate a 7-day rolling average of user sign-ups per day to smooth out daily volatility. If a date has fewer than 6 preceding days, compute using all available preceding days.',
    schema: `TABLE DailySignups (
  signup_date DATE,
  signup_count INTEGER
)`,
    setupSql: `
      DROP TABLE IF EXISTS DailySignups;
      CREATE TABLE DailySignups (
          signup_date DATE,
          signup_count INT
      );
      INSERT INTO DailySignups (signup_date, signup_count) VALUES
      ('2023-01-01', 10), ('2023-01-02', 20), ('2023-01-03', 15), ('2023-01-04', 30),
      ('2023-01-05', 25), ('2023-01-06', 40), ('2023-01-07', 35), ('2023-01-08', 50),
      ('2023-01-09', 45), ('2023-01-10', 60), ('2023-01-11', 55), ('2023-01-12', 70),
      ('2023-01-13', 65), ('2023-01-14', 80), ('2023-01-15', 75), ('2023-01-16', 90),
      ('2023-01-17', 85), ('2023-01-18', 100), ('2023-01-19', 95), ('2023-01-20', 110),
      ('2023-01-21', 105), ('2023-01-22', 120);
    `,
    solutionSql: `SELECT 
  signup_date,
  signup_count,
  ROUND(
    AVG(signup_count) OVER (
      ORDER BY signup_date 
      ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ), 
    2
  ) AS rolling_avg
FROM DailySignups
ORDER BY signup_date;`,
    company: 'Google',
    topic: 'Window Functions',
    hints: [
      'Use a window function to calculate the average of signup_count.',
      'Specify the frame clause ROWS BETWEEN 6 PRECEDING AND CURRENT ROW in the OVER clause.',
      'Round the resulting rolling average to 2 decimal places.'
    ]
  },
  {
    id: 'q8',
    difficulty: 'Hard',
    title: 'Longest Streak',
    description: 'Find the longest consecutive purchase streak (in days) for each user. Return the result ordered by user_id.',
    schema: `TABLE user_purchases (
  user_id INTEGER,
  purchase_date DATE
)`,
    setupSql: `
      DROP TABLE IF EXISTS user_purchases;
      CREATE TABLE user_purchases (
          user_id INT,
          purchase_date DATE
      );
      INSERT INTO user_purchases (user_id, purchase_date) VALUES
      (1, '2023-10-01'), (1, '2023-10-02'), (1, '2023-10-03'), (1, '2023-10-06'), (1, '2023-10-07'),
      (2, '2023-10-05'), (2, '2023-10-06'), (2, '2023-10-08'), (2, '2023-10-09'), (2, '2023-10-10'),
      (3, '2023-10-01'), (3, '2023-10-03'), (3, '2023-10-05'), (3, '2023-10-07'), (3, '2023-10-09'),
      (1, '2023-10-11'), (1, '2023-10-12'), (1, '2023-10-13'), (1, '2023-10-14'), (1, '2023-10-15'),
      (2, '2023-10-12'), (2, '2023-10-13'), (3, '2023-10-11'), (3, '2023-10-12');
    `,
    solutionSql: `WITH DistinctPurchases AS (
  SELECT DISTINCT user_id, purchase_date
  FROM user_purchases
),
GroupedStreaks AS (
  SELECT 
    user_id,
    purchase_date,
    purchase_date - CAST(ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY purchase_date) AS INT) as grp_date
  FROM DistinctPurchases
),
StreakLengths AS (
  SELECT 
    user_id, 
    grp_date, 
    COUNT(*) as streak_length
  FROM GroupedStreaks
  GROUP BY user_id, grp_date
)
SELECT 
  user_id,
  MAX(streak_length) as longest_streak
FROM StreakLengths
GROUP BY user_id
ORDER BY user_id;`,
    company: 'Amazon',
    topic: 'Window Functions',
    hints: [
      'First use ROW_NUMBER() partitioned by user_id to identify consecutive islands of purchase dates.',
      'Subtracting the row number from purchase_date groups consecutive streaks together.',
      'Find the count per island, and then extract the MAX streak length for each user.'
    ]
  },
  {
    id: 'q9',
    difficulty: 'Hard',
    title: 'Swap Seats',
    description: 'Swap the seat ID of every two consecutive students. If the number of students is odd, the ID of the last student is not swapped. Return the result table ordered by ID in ascending order.',
    schema: `TABLE Seat (
  id INTEGER,
  student VARCHAR(50)
)`,
    setupSql: `
      DROP TABLE IF EXISTS Seat;
      CREATE TABLE Seat (
          id INT,
          student VARCHAR(50)
      );
      INSERT INTO Seat (id, student) VALUES
      (1, 'Abbot'), (2, 'Doris'), (3, 'Emerson'), (4, 'Green'), (5, 'Jeames'),
      (6, 'Hannah'), (7, 'Ian'), (8, 'Julia'), (9, 'Kevin'), (10, 'Laura'),
      (11, 'Michael'), (12, 'Nina'), (13, 'Oliver'), (14, 'Penelope'), (15, 'Quinn'),
      (16, 'Rachel'), (17, 'Samuel'), (18, 'Tina'), (19, 'Ulysses'), (20, 'Valerie'),
      (21, 'William');
    `,
    solutionSql: `SELECT 
  CASE 
    WHEN id % 2 = 1 AND id = (SELECT MAX(id) FROM Seat) THEN id
    WHEN id % 2 = 1 THEN id + 1
    ELSE id - 1
  END AS id,
  student
FROM Seat
ORDER BY id ASC;`,
    company: 'Uber',
    topic: 'CASE & Logic',
    hints: [
      'Use a CASE statement to modify the id column.',
      'If the id is odd and it is the maximum id in the table, keep it as is.',
      'If the id is odd (but not the last), add 1 to it. If it is even, subtract 1 from it.'
    ]
  },
  {
    id: 'q10',
    difficulty: 'Hard',
    title: 'Pareto Analysis',
    description: 'Identify the top customers who generate 80% of total revenue. Return customer_id and spend (named spend), ordered by spend descending.',
    schema: `TABLE SalesOrders (
  customer_id INTEGER,
  spend DECIMAL(10, 2)
)`,
    setupSql: `
      DROP TABLE IF EXISTS SalesOrders;
      CREATE TABLE SalesOrders (
          customer_id INT,
          spend DECIMAL(10, 2)
      );
      INSERT INTO SalesOrders (customer_id, spend) VALUES
      (101, 5000.00), (102, 3000.00), (103, 1000.00), (104, 1000.00),
      (105, 7500.00), (106, 500.00), (107, 2500.00), (108, 1500.00),
      (109, 8000.00), (110, 200.00), (111, 1200.00), (112, 600.00),
      (113, 9000.00), (114, 400.00), (115, 3500.00), (116, 800.00),
      (117, 4500.00), (118, 1100.00), (119, 10000.00), (120, 300.00);
    `,
    solutionSql: `WITH CustomerSpend AS (
  SELECT 
    customer_id,
    SUM(spend) as total_customer_spend
  FROM SalesOrders
  GROUP BY customer_id
),
ParetoWindow AS (
  SELECT 
    customer_id,
    total_customer_spend,
    SUM(total_customer_spend) OVER (ORDER BY total_customer_spend DESC) AS cumulative_spend,
    SUM(total_overall_revenue) AS total_overall_revenue
  FROM (
    SELECT 
      customer_id,
      total_customer_spend,
      SUM(total_customer_spend) OVER () AS total_overall_revenue
    FROM CustomerSpend
  ) tmp
)
SELECT 
  customer_id, 
  total_customer_spend AS spend
FROM ParetoWindow
WHERE cumulative_spend <= 0.80 * total_overall_revenue
ORDER BY spend DESC;`,
    company: 'Google',
    topic: 'Window Functions',
    hints: [
      'Aggregate customer spending using SUM() and GROUP BY customer_id.',
      'Use SUM() OVER(ORDER BY ... DESC) to compute the running total of spending from largest to smallest.',
      'Compare this running total to 80% of the grand total (which can be calculated using SUM() OVER()).'
    ]
  },
  // ===== NEW EASY QUESTIONS FROM NOTION =====
  {
    id: 'q11',
    difficulty: 'Easy',
    title: 'Third Highest Spender',
    description: 'Find the customer(s) with the third highest total transaction amount, using DENSE_RANK (no gaps between ranks). Return customer_id, first_name, and last_name.',
    schema: `TABLE customers (customer_id INT PK, first_name VARCHAR, last_name VARCHAR)
TABLE transactions (txn_id INT PK, customer_id INT, transaction_amount DECIMAL)`,
    setupSql: `
      DROP TABLE IF EXISTS transactions; DROP TABLE IF EXISTS customers;
      CREATE TABLE customers (customer_id INT PRIMARY KEY, first_name VARCHAR(50), last_name VARCHAR(50));
      CREATE TABLE transactions (txn_id INT PRIMARY KEY, customer_id INT, transaction_amount DECIMAL(10,2));
      INSERT INTO customers VALUES (1,'Alice','Smith'),(2,'Bob','Jones'),(3,'Carol','Lee'),(4,'Dave','Kim'),(5,'Eve','Park'),(6,'Frank','Chen'),(7,'Grace','Wu'),(8,'Hank','Das'),(9,'Ivy','Roy'),(10,'Jack','Xu');
      INSERT INTO transactions VALUES (1,1,5000),(2,1,3000),(3,2,8000),(4,2,2000),(5,3,4000),(6,3,4000),(7,4,1500),(8,4,500),(9,5,9000),(10,5,1000),(11,6,6000),(12,6,6000),(13,7,3500),(14,7,3500),(15,8,2000),(16,9,7000),(17,9,500),(18,10,1200),(19,1,2000),(20,3,1000);
    `,
    solutionSql: `WITH customer_totals AS (
  SELECT c.customer_id, c.first_name, c.last_name, SUM(t.transaction_amount) AS total_amount
  FROM customers c JOIN transactions t ON c.customer_id = t.customer_id
  GROUP BY c.customer_id, c.first_name, c.last_name
),
ranked AS (
  SELECT *, DENSE_RANK() OVER (ORDER BY total_amount DESC) AS rnk FROM customer_totals
)
SELECT customer_id, first_name, last_name FROM ranked WHERE rnk = 3;`,
    company: 'Amazon',
    topic: 'Window Functions',
    hints: ['Aggregate total transaction amount per customer using SUM and GROUP BY.','Use DENSE_RANK() — not RANK or ROW_NUMBER — because the question asks for no gaps.','Filter for rank = 3 in an outer query.']
  },
  {
    id: 'q12',
    difficulty: 'Easy',
    title: 'High-Value Repeat Customers',
    description: 'Identify customers who have made transactions above 10,000 more than once. Return customer_id and the count of such transactions.',
    schema: `TABLE transactions (txn_id INT PK, customer_id INT, transaction_amount DECIMAL, txn_date DATE)`,
    setupSql: `
      DROP TABLE IF EXISTS transactions;
      CREATE TABLE transactions (txn_id INT PRIMARY KEY, customer_id INT, transaction_amount DECIMAL(10,2), txn_date DATE);
      INSERT INTO transactions VALUES (1,101,15000,'2023-01-05'),(2,101,12000,'2023-02-10'),(3,102,8000,'2023-01-15'),(4,103,25000,'2023-03-01'),(5,103,11000,'2023-04-12'),(6,103,9000,'2023-05-20'),(7,104,50000,'2023-01-08'),(8,104,30000,'2023-02-14'),(9,104,7000,'2023-03-22'),(10,105,9500,'2023-04-01'),(11,106,18000,'2023-05-10'),(12,106,22000,'2023-06-15'),(13,107,6000,'2023-07-01'),(14,108,14000,'2023-08-05'),(15,108,16000,'2023-09-10'),(16,108,11000,'2023-10-15'),(17,109,5000,'2023-11-01'),(18,110,13000,'2023-12-01'),(19,110,9000,'2023-12-15'),(20,101,20000,'2023-06-20');
    `,
    solutionSql: `SELECT customer_id, COUNT(*) AS high_value_txns
FROM transactions
WHERE transaction_amount > 10000
GROUP BY customer_id
HAVING COUNT(*) > 1
ORDER BY high_value_txns DESC;`,
    company: 'Stripe',
    topic: 'Aggregation',
    hints: ['Filter rows WHERE transaction_amount > 10000 first.','GROUP BY customer_id and count the remaining rows.','Use HAVING COUNT(*) > 1 to keep only repeat high-value customers.']
  },
  {
    id: 'q13',
    difficulty: 'Easy',
    title: 'Managers With 7+ Reports',
    description: 'Find the first names of managers who have at least 7 direct reporting employees. If an employee reports to themselves, count that row too.',
    schema: `TABLE employees (employee_id INT PK, first_name VARCHAR, manager_id INT)`,
    setupSql: `
      DROP TABLE IF EXISTS employees;
      CREATE TABLE employees (employee_id INT PRIMARY KEY, first_name VARCHAR(50), manager_id INT);
      INSERT INTO employees VALUES (1,'Alice',1),(2,'Bob',1),(3,'Carol',1),(4,'Dave',1),(5,'Eve',1),(6,'Frank',1),(7,'Grace',1),(8,'Hank',1),(9,'Ivy',2),(10,'Jack',2),(11,'Kate',2),(12,'Leo',2),(13,'Mia',2),(14,'Nate',2),(15,'Olga',2),(16,'Pete',3),(17,'Quinn',3),(18,'Rosa',3),(19,'Sam',3),(20,'Tina',3),(21,'Uma',3),(22,'Vera',3),(23,'Will',3),(24,'Xena',4),(25,'Yuri',4);
    `,
    solutionSql: `SELECT m.first_name
FROM employees e
JOIN employees m ON e.manager_id = m.employee_id
GROUP BY m.employee_id, m.first_name
HAVING COUNT(e.employee_id) >= 7;`,
    company: 'Meta',
    topic: 'Joins',
    hints: ['Self-join employees: e.manager_id = m.employee_id.','Group by manager and count employees.','Self-reporting employees are counted automatically since manager_id = employee_id.']
  },
  {
    id: 'q14',
    difficulty: 'Easy',
    title: 'YoY Product Launches',
    description: 'For each company, calculate the net difference between products launched in 2020 versus 2019.',
    schema: `TABLE product_launches (launch_id INT PK, company_name VARCHAR, product_name VARCHAR, launch_year INT)`,
    setupSql: `
      DROP TABLE IF EXISTS product_launches;
      CREATE TABLE product_launches (launch_id INT PRIMARY KEY, company_name VARCHAR(100), product_name VARCHAR(100), launch_year INT);
      INSERT INTO product_launches VALUES (1,'Apple','iPhone SE',2019),(2,'Apple','AirPods Pro',2019),(3,'Apple','iPad Air',2020),(4,'Apple','iPhone 12',2020),(5,'Apple','HomePod Mini',2020),(6,'Samsung','Galaxy S10',2019),(7,'Samsung','Galaxy Note 10',2019),(8,'Samsung','Galaxy S20',2020),(9,'Samsung','Galaxy Z Flip',2020),(10,'Samsung','Galaxy Buds Live',2020),(11,'Samsung','Galaxy Tab S7',2020),(12,'Google','Pixel 3a',2019),(13,'Google','Pixel 4',2019),(14,'Google','Nest Mini',2019),(15,'Google','Pixel 4a',2020),(16,'Google','Pixel 5',2020),(17,'Microsoft','Surface Pro 7',2019),(18,'Microsoft','Surface Laptop 3',2019),(19,'Microsoft','Surface Go 2',2020),(20,'Microsoft','Surface Duo',2020),(21,'Microsoft','Xbox Series X',2020);
    `,
    solutionSql: `SELECT company_name,
  COUNT(CASE WHEN launch_year = 2020 THEN product_name END)
    - COUNT(CASE WHEN launch_year = 2019 THEN product_name END) AS net_products
FROM product_launches
WHERE launch_year IN (2019, 2020)
GROUP BY company_name;`,
    company: 'LinkedIn',
    topic: 'Aggregation',
    hints: ['Use conditional aggregation: COUNT(CASE WHEN year = 2020 THEN ...).','Subtract 2019 count from 2020 count.','Pro tip: for YoY comparisons, conditional aggregation is the fastest interview answer.']
  },
  {
    id: 'q15',
    difficulty: 'Easy',
    title: 'Users With Two Skills',
    description: 'Find candidate_ids who have both Python and Tableau as skills.',
    schema: `TABLE candidate_skills (candidate_id INT, skill VARCHAR)`,
    setupSql: `
      DROP TABLE IF EXISTS candidate_skills;
      CREATE TABLE candidate_skills (candidate_id INT, skill VARCHAR(50));
      INSERT INTO candidate_skills VALUES (101,'Python'),(101,'Tableau'),(101,'SQL'),(102,'Python'),(102,'R'),(102,'Excel'),(103,'Tableau'),(103,'PowerBI'),(104,'Python'),(104,'Tableau'),(104,'Spark'),(105,'SQL'),(105,'Python'),(106,'Tableau'),(106,'Python'),(106,'Java'),(107,'R'),(107,'Tableau'),(108,'Python'),(108,'SQL'),(108,'Tableau'),(109,'Excel'),(109,'PowerBI'),(110,'Python'),(110,'Spark');
    `,
    solutionSql: `SELECT candidate_id
FROM candidate_skills
WHERE skill IN ('Python', 'Tableau')
GROUP BY candidate_id
HAVING COUNT(DISTINCT skill) = 2;`,
    company: 'LinkedIn',
    topic: 'Aggregation',
    hints: ['Filter to only Python and Tableau rows first.','GROUP BY candidate_id and use HAVING COUNT(DISTINCT skill) = 2.','Alternative approach: use INTERSECT between two queries.']
  },
  {
    id: 'q16',
    difficulty: 'Easy',
    title: 'Famous Percentage',
    description: 'For each user, calculate their "famous percentage" as (follower_count / total_users) * 100. Users appear in both user_id and follower_id columns.',
    schema: `TABLE followers (user_id INT, follower_id INT)`,
    setupSql: `
      DROP TABLE IF EXISTS followers;
      CREATE TABLE followers (user_id INT, follower_id INT);
      INSERT INTO followers VALUES (1,2),(1,3),(1,4),(1,5),(2,1),(2,3),(2,6),(3,1),(3,4),(4,5),(4,6),(4,7),(5,1),(5,2),(5,3),(5,4),(5,6),(5,7),(5,8),(6,1),(6,2),(7,3),(7,8),(8,1);
    `,
    solutionSql: `WITH all_users AS (
  SELECT user_id FROM followers UNION SELECT follower_id FROM followers
),
follower_counts AS (
  SELECT user_id, COUNT(DISTINCT follower_id) AS cnt FROM followers GROUP BY user_id
)
SELECT u.user_id,
  ROUND(100.0 * COALESCE(f.cnt, 0) / (SELECT COUNT(*) FROM all_users), 2) AS famous_pct
FROM all_users u LEFT JOIN follower_counts f ON u.user_id = f.user_id
ORDER BY u.user_id;`,
    company: 'Meta',
    topic: 'Joins',
    hints: ['Build the full user list from UNION of user_id and follower_id.','LEFT JOIN so users with zero followers still appear.','Use COUNT(*) OVER() or a subquery for the total user count.']
  },
  {
    id: 'q17',
    difficulty: 'Easy',
    title: '7-Day Signup Conversion',
    description: 'Determine the percentage of users who made a purchase within 7 days of signup using event logs.',
    schema: `TABLE events (user_id INT, event_type VARCHAR, event_date DATE)`,
    setupSql: `
      DROP TABLE IF EXISTS events;
      CREATE TABLE events (user_id INT, event_type VARCHAR(20), event_date DATE);
      INSERT INTO events VALUES (1,'signup','2023-01-01'),(1,'purchase','2023-01-05'),(2,'signup','2023-01-02'),(2,'purchase','2023-01-15'),(3,'signup','2023-01-03'),(3,'purchase','2023-01-04'),(4,'signup','2023-01-04'),(5,'signup','2023-01-05'),(5,'purchase','2023-01-06'),(6,'signup','2023-01-06'),(6,'purchase','2023-01-20'),(7,'signup','2023-01-07'),(7,'purchase','2023-01-08'),(8,'signup','2023-01-08'),(9,'signup','2023-01-09'),(9,'purchase','2023-01-10'),(10,'signup','2023-01-10'),(10,'purchase','2023-01-11'),(11,'signup','2023-01-11'),(12,'signup','2023-01-12'),(12,'purchase','2023-01-25'),(13,'signup','2023-01-13'),(13,'purchase','2023-01-14'),(14,'signup','2023-01-14'),(15,'signup','2023-01-15'),(15,'purchase','2023-01-16'),(16,'signup','2023-01-16'),(17,'signup','2023-01-17'),(17,'purchase','2023-01-18'),(18,'signup','2023-01-18'),(18,'purchase','2023-02-01'),(19,'signup','2023-01-19'),(19,'purchase','2023-01-20'),(20,'signup','2023-01-20');
    `,
    solutionSql: `WITH signups AS (
  SELECT user_id, event_date AS signup_date FROM events WHERE event_type = 'signup'
),
purchases AS (
  SELECT user_id, MIN(event_date) AS first_purchase FROM events WHERE event_type = 'purchase' GROUP BY user_id
)
SELECT ROUND(100.0 * COUNT(p.user_id) / COUNT(s.user_id), 2) AS conversion_pct
FROM signups s
LEFT JOIN purchases p ON s.user_id = p.user_id AND p.first_purchase <= s.signup_date + 7;`,
    company: 'Uber',
    topic: 'Joins',
    hints: ['Separate signup and purchase events into CTEs.','LEFT JOIN with date condition: purchase within 7 days of signup.','Divide matched count by total signups × 100.']
  },
  {
    id: 'q18',
    difficulty: 'Easy',
    title: 'Percentile Contributors',
    description: 'Compute quartiles, deciles, and percent rank for each employee by revenue. Identify the top and bottom 10% contributors.',
    schema: `TABLE revenue (employee_id INT PK, department VARCHAR, revenue DECIMAL)`,
    setupSql: `
      DROP TABLE IF EXISTS revenue;
      CREATE TABLE revenue (employee_id INT PRIMARY KEY, department VARCHAR(50), revenue DECIMAL(10,2));
      INSERT INTO revenue VALUES (1,'Sales',50000),(2,'Sales',62000),(3,'Sales',45000),(4,'Sales',78000),(5,'Sales',91000),(6,'Sales',33000),(7,'Sales',55000),(8,'Sales',67000),(9,'Sales',72000),(10,'Sales',41000),(11,'Marketing',38000),(12,'Marketing',52000),(13,'Marketing',61000),(14,'Marketing',44000),(15,'Marketing',73000),(16,'Marketing',29000),(17,'Marketing',58000),(18,'Marketing',65000),(19,'Engineering',95000),(20,'Engineering',87000),(21,'Engineering',76000),(22,'Engineering',105000);
    `,
    solutionSql: `SELECT employee_id, department, revenue,
  NTILE(4) OVER (ORDER BY revenue) AS quartile,
  NTILE(10) OVER (ORDER BY revenue) AS decile,
  ROUND(PERCENT_RANK() OVER (ORDER BY revenue)::numeric, 4) AS pct_rank
FROM revenue
ORDER BY revenue;`,
    company: 'Google',
    topic: 'Window Functions',
    hints: ['NTILE(4) divides rows into quartiles.','NTILE(10) gives deciles — decile 1 is bottom 10%, decile 10 is top 10%.','PERCENT_RANK() gives continuous percentile between 0 and 1.']
  },
  {
    id: 'q19',
    difficulty: 'Easy',
    title: 'Max Customer Coverage',
    description: 'Find all employees tied for the maximum number of distinct customers served.',
    schema: `TABLE sales_reps (employee_id INT, customer_id INT, sale_date DATE)`,
    setupSql: `
      DROP TABLE IF EXISTS sales_reps;
      CREATE TABLE sales_reps (employee_id INT, customer_id INT, sale_date DATE);
      INSERT INTO sales_reps VALUES (1,101,'2023-01-01'),(1,102,'2023-01-05'),(1,103,'2023-01-10'),(1,104,'2023-02-01'),(1,105,'2023-02-15'),(1,106,'2023-03-01'),(1,107,'2023-03-15'),(2,101,'2023-01-02'),(2,102,'2023-01-06'),(2,108,'2023-02-01'),(2,109,'2023-02-10'),(2,110,'2023-03-05'),(2,111,'2023-03-20'),(2,112,'2023-04-01'),(3,101,'2023-01-03'),(3,113,'2023-02-05'),(3,114,'2023-03-10'),(4,115,'2023-01-10'),(4,116,'2023-02-15'),(4,117,'2023-03-01'),(4,118,'2023-03-20'),(4,119,'2023-04-01');
    `,
    solutionSql: `WITH coverage AS (
  SELECT employee_id, COUNT(DISTINCT customer_id) AS customer_count
  FROM sales_reps GROUP BY employee_id
)
SELECT employee_id, customer_count
FROM coverage
WHERE customer_count = (SELECT MAX(customer_count) FROM coverage);`,
    company: 'Amazon',
    topic: 'Subqueries',
    hints: ['COUNT(DISTINCT customer_id) per employee.','Use a subquery to find the MAX count.','Filter for employees whose count equals the max.']
  },
  {
    id: 'q20',
    difficulty: 'Easy',
    title: 'Earning More Than Manager',
    description: 'Find employees who earn more than their direct manager. Return the employee name.',
    schema: `TABLE employees (id INT PK, name VARCHAR, salary INT, manager_id INT)`,
    setupSql: `
      DROP TABLE IF EXISTS employees;
      CREATE TABLE employees (id INT PRIMARY KEY, name VARCHAR(50), salary INT, manager_id INT);
      INSERT INTO employees VALUES (1,'Alice',90000,NULL),(2,'Bob',75000,1),(3,'Carol',95000,1),(4,'Dave',60000,2),(5,'Eve',80000,2),(6,'Frank',70000,3),(7,'Grace',100000,3),(8,'Hank',65000,4),(9,'Ivy',72000,5),(10,'Jack',85000,5),(11,'Kate',55000,6),(12,'Leo',78000,6),(13,'Mia',68000,7),(14,'Nate',88000,7),(15,'Olga',62000,8),(16,'Pete',71000,8),(17,'Quinn',92000,1),(18,'Rosa',58000,4),(19,'Sam',76000,9),(20,'Tina',82000,10);
    `,
    solutionSql: `SELECT e.name AS employee_name
FROM employees e
JOIN employees m ON e.manager_id = m.id
WHERE e.salary > m.salary;`,
    company: 'Google',
    topic: 'Joins',
    hints: ['Self-join: e.manager_id = m.id.','Compare e.salary > m.salary in WHERE.','Classic self-join pattern for hierarchical data.']
  },
  {
    id: 'q21',
    difficulty: 'Easy',
    title: 'Email Domain Filter',
    description: 'Find all users whose email belongs to @google.com domain. Return user_id, name, and email.',
    schema: `TABLE users (user_id INT PK, name VARCHAR, email VARCHAR)`,
    setupSql: `
      DROP TABLE IF EXISTS users;
      CREATE TABLE users (user_id INT PRIMARY KEY, name VARCHAR(100), email VARCHAR(200));
      INSERT INTO users VALUES (1,'Alice Smith','alice@google.com'),(2,'Bob Jones','bob@yahoo.com'),(3,'Carol Lee','carol@google.com'),(4,'Dave Kim','dave@microsoft.com'),(5,'Eve Park','eve@google.com'),(6,'Frank Chen','frank@amazon.com'),(7,'Grace Wu','grace@meta.com'),(8,'Hank Das','hank@google.com'),(9,'Ivy Roy','ivy@apple.com'),(10,'Jack Xu','jack@google.com'),(11,'Kate Lin','kate@uber.com'),(12,'Leo Tan','leo@google.com'),(13,'Mia Sun','mia@stripe.com'),(14,'Nate Fox','nate@airbnb.com'),(15,'Olga Rao','olga@google.com'),(16,'Pete Yam','pete@netflix.com'),(17,'Quinn Bai','quinn@meta.com'),(18,'Rosa Gil','rosa@google.com'),(19,'Sam Cho','sam@amazon.com'),(20,'Tina Wen','tina@google.com');
    `,
    solutionSql: `SELECT user_id, name, email
FROM users
WHERE email LIKE '%@google.com'
ORDER BY user_id;`,
    company: 'Google',
    topic: 'String Functions',
    hints: ['Use LIKE with wildcard: %@google.com.','Alternative: use string functions to extract domain.','Make sure to match the full domain, not just a substring.']
  },
  {"id":"q22","difficulty":"Medium","title":"Monthly Loyal Buyers","description":"Find customers who bought products every month in a given year.","schema":"TABLE orders (order_id INT PK, customer_id INT, order_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS orders;CREATE TABLE orders(order_id INT PRIMARY KEY,customer_id INT,order_date DATE,amount DECIMAL(10,2));INSERT INTO orders VALUES(1,1,'2023-01-15',100),(2,1,'2023-02-10',200),(3,1,'2023-03-05',150),(4,1,'2023-04-20',300),(5,1,'2023-05-12',250),(6,1,'2023-06-08',180),(7,1,'2023-07-22',220),(8,1,'2023-08-14',190),(9,1,'2023-09-03',310),(10,1,'2023-10-17',270),(11,1,'2023-11-25',160),(12,1,'2023-12-30',400),(13,2,'2023-01-05',90),(14,2,'2023-03-15',120),(15,2,'2023-06-20',200),(16,3,'2023-01-10',150),(17,3,'2023-02-14',180),(18,3,'2023-03-22',200),(19,3,'2023-04-18',160),(20,3,'2023-05-25',140),(21,3,'2023-06-30',190),(22,3,'2023-07-15',210),(23,3,'2023-08-20',170),(24,3,'2023-09-10',230),(25,3,'2023-10-05',190),(26,3,'2023-11-18',220),(27,3,'2023-12-12',250),(28,4,'2023-01-08',80),(29,4,'2023-02-22',110);","solutionSql":"SELECT customer_id FROM orders WHERE EXTRACT(YEAR FROM order_date)=2023 GROUP BY customer_id HAVING COUNT(DISTINCT EXTRACT(MONTH FROM order_date))=12;","company":"Amazon","topic":"Aggregation","hints":["Extract month and year from order_date.","GROUP BY customer_id and count DISTINCT months.","HAVING COUNT(DISTINCT month) = 12 means every month."]},
  {"id":"q23","difficulty":"Medium","title":"Spaces in a Name","description":"Count the number of spaces in each employee name.","schema":"TABLE employees (id INT PK, full_name VARCHAR)","setupSql":"DROP TABLE IF EXISTS employees;CREATE TABLE employees(id INT PRIMARY KEY,full_name VARCHAR(100));INSERT INTO employees VALUES(1,'John Smith'),(2,'Mary Jane Watson'),(3,'Alice'),(4,'Bob Lee Jr'),(5,'Anna Maria Gonzalez Lopez'),(6,'Tom'),(7,'Li Wei Chen'),(8,'Rosa Maria de la Cruz'),(9,'Sam'),(10,'Jean Claude Van Damme'),(11,'Ivy'),(12,'Kim Jong Un'),(13,'Marie'),(14,'Carlos Eduardo Silva Santos'),(15,'Eve'),(16,'Hans Peter Mueller'),(17,'Ana'),(18,'James Earl Ray Jones'),(19,'Mo'),(20,'Sri Devi Lakshmi Naidu');","solutionSql":"SELECT full_name, LENGTH(full_name)-LENGTH(REPLACE(full_name,' ','')) AS space_count FROM employees ORDER BY space_count DESC;","company":"Google","topic":"String Functions","hints":["Compare LENGTH of original string vs string with spaces removed.","REPLACE(name, \" \", \"\") removes all spaces.","The difference gives the space count."]},
  {"id":"q24","difficulty":"Medium","title":"Cross-Category Shoppers","description":"Find customers who purchased from both Electronics and Fashion categories in the same order but paid using different payment methods.","schema":"TABLE order_items (order_id INT, customer_id INT, category VARCHAR, payment_method VARCHAR)","setupSql":"DROP TABLE IF EXISTS order_items;CREATE TABLE order_items(order_id INT,customer_id INT,category VARCHAR(50),payment_method VARCHAR(50));INSERT INTO order_items VALUES(1,101,'Electronics','Credit'),(1,101,'Fashion','Debit'),(2,102,'Electronics','Credit'),(2,102,'Fashion','Credit'),(3,103,'Electronics','UPI'),(3,103,'Fashion','Credit'),(4,104,'Electronics','Credit'),(4,104,'Home','Debit'),(5,105,'Fashion','UPI'),(5,105,'Electronics','Debit'),(6,106,'Electronics','Credit'),(7,107,'Fashion','Debit'),(8,108,'Electronics','UPI'),(8,108,'Fashion','UPI'),(9,109,'Electronics','Credit'),(9,109,'Fashion','Debit'),(10,110,'Home','Credit'),(10,110,'Fashion','Credit'),(11,101,'Electronics','Credit'),(11,101,'Fashion','Credit'),(12,103,'Electronics','Debit'),(12,103,'Fashion','UPI');","solutionSql":"SELECT DISTINCT a.order_id, a.customer_id FROM order_items a JOIN order_items b ON a.order_id=b.order_id AND a.customer_id=b.customer_id WHERE a.category='Electronics' AND b.category='Fashion' AND a.payment_method<>b.payment_method;","company":"Amazon","topic":"Joins","hints":["Self-join on order_id matching Electronics to Fashion rows.","Add condition a.payment_method <> b.payment_method.","Use DISTINCT to avoid duplicate results."]},
  {"id":"q25","difficulty":"Medium","title":"Exclusive Products","description":"Find products that are sold exclusively on Amazon (not on any other platform), matched by product_name and mrp.","schema":"TABLE products (product_id INT PK, platform VARCHAR, product_name VARCHAR, mrp DECIMAL)","setupSql":"DROP TABLE IF EXISTS products;CREATE TABLE products(product_id INT PRIMARY KEY,platform VARCHAR(50),product_name VARCHAR(100),mrp DECIMAL(10,2));INSERT INTO products VALUES(1,'Amazon','Widget A',299),(2,'Flipkart','Widget A',299),(3,'Amazon','Gadget B',599),(4,'Amazon','Gadget C',899),(5,'Flipkart','Gadget C',899),(6,'Amazon','Tool D',149),(7,'Myntra','Tool D',149),(8,'Amazon','Device E',1999),(9,'Amazon','Accessory F',79),(10,'Flipkart','Accessory F',79),(11,'Amazon','Part G',399),(12,'Amazon','Module H',499),(13,'Meesho','Module H',499),(14,'Amazon','Sensor I',249),(15,'Amazon','Board J',699),(16,'Flipkart','Board J',699),(17,'Amazon','Kit K',999),(18,'Amazon','Pack L',159),(19,'Myntra','Pack L',159),(20,'Amazon','Set M',449);","solutionSql":"SELECT p1.product_name, p1.mrp FROM products p1 WHERE p1.platform='Amazon' AND NOT EXISTS(SELECT 1 FROM products p2 WHERE p2.product_name=p1.product_name AND p2.mrp=p1.mrp AND p2.platform<>'Amazon');","company":"Amazon","topic":"Subqueries","hints":["Filter Amazon products first.","Use NOT EXISTS or LEFT JOIN to check no other platform sells the same product+mrp.","Match on both product_name AND mrp for exact exclusivity."]},
  {"id":"q26","difficulty":"Medium","title":"Close Registration Pairs","description":"Find pairs of customers who registered within 1 day of each other.","schema":"TABLE customers (customer_id INT PK, name VARCHAR, reg_date DATE)","setupSql":"DROP TABLE IF EXISTS customers;CREATE TABLE customers(customer_id INT PRIMARY KEY,name VARCHAR(50),reg_date DATE);INSERT INTO customers VALUES(1,'Alice','2023-01-01'),(2,'Bob','2023-01-02'),(3,'Carol','2023-01-01'),(4,'Dave','2023-01-04'),(5,'Eve','2023-01-05'),(6,'Frank','2023-01-03'),(7,'Grace','2023-01-06'),(8,'Hank','2023-01-06'),(9,'Ivy','2023-01-08'),(10,'Jack','2023-01-09'),(11,'Kate','2023-01-10'),(12,'Leo','2023-01-10'),(13,'Mia','2023-01-12'),(14,'Nate','2023-01-13'),(15,'Olga','2023-01-15'),(16,'Pete','2023-01-15'),(17,'Quinn','2023-01-16'),(18,'Rosa','2023-01-18'),(19,'Sam','2023-01-19'),(20,'Tina','2023-01-20');","solutionSql":"SELECT a.name AS customer1, b.name AS customer2, a.reg_date AS date1, b.reg_date AS date2 FROM customers a JOIN customers b ON a.customer_id<b.customer_id WHERE ABS(a.reg_date-b.reg_date)<=1 ORDER BY a.reg_date;","company":"Uber","topic":"Joins","hints":["Self-join with a.customer_id < b.customer_id to avoid duplicates.","Use ABS(date difference) <= 1 for within 1 day.","Order by registration date for readability."]},
  {"id":"q27","difficulty":"Medium","title":"Friday Q1 Averages","description":"Calculate the average order amount for each Friday in Q1 (Jan-Mar).","schema":"TABLE orders (order_id INT PK, order_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS orders;CREATE TABLE orders(order_id INT PRIMARY KEY,order_date DATE,amount DECIMAL(10,2));INSERT INTO orders VALUES(1,'2023-01-06',150),(2,'2023-01-06',200),(3,'2023-01-13',300),(4,'2023-01-13',250),(5,'2023-01-13',180),(6,'2023-01-20',400),(7,'2023-01-27',350),(8,'2023-01-27',275),(9,'2023-02-03',190),(10,'2023-02-03',220),(11,'2023-02-10',310),(12,'2023-02-17',280),(13,'2023-02-17',320),(14,'2023-02-24',150),(15,'2023-03-03',400),(16,'2023-03-03',350),(17,'2023-03-10',290),(18,'2023-03-17',180),(19,'2023-03-24',420),(20,'2023-03-31',370),(21,'2023-01-07',500),(22,'2023-04-07',600);","solutionSql":"SELECT order_date, ROUND(AVG(amount),2) AS avg_amount FROM orders WHERE EXTRACT(DOW FROM order_date)=5 AND EXTRACT(MONTH FROM order_date) BETWEEN 1 AND 3 AND EXTRACT(YEAR FROM order_date)=2023 GROUP BY order_date ORDER BY order_date;","company":"Stripe","topic":"Date Functions","hints":["Use EXTRACT(DOW FROM date) to identify Fridays (5 in PostgreSQL).","Filter months 1-3 for Q1.","GROUP BY each Friday date and compute AVG(amount)."]},
  {"id":"q28","difficulty":"Medium","title":"Missing Transaction Dates","description":"Find dates in a date range that have no transactions (gaps in the data).","schema":"TABLE transactions (txn_id INT PK, txn_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS transactions;CREATE TABLE transactions(txn_id INT PRIMARY KEY,txn_date DATE,amount DECIMAL(10,2));INSERT INTO transactions VALUES(1,'2023-01-01',100),(2,'2023-01-01',200),(3,'2023-01-02',150),(4,'2023-01-04',300),(5,'2023-01-05',250),(6,'2023-01-07',180),(7,'2023-01-08',220),(8,'2023-01-10',310),(9,'2023-01-11',280),(10,'2023-01-12',150),(11,'2023-01-14',400),(12,'2023-01-15',350),(13,'2023-01-17',290),(14,'2023-01-18',180),(15,'2023-01-19',420),(16,'2023-01-21',370),(17,'2023-01-22',260),(18,'2023-01-24',330),(19,'2023-01-25',190),(20,'2023-01-27',450);","solutionSql":"WITH date_range AS(SELECT generate_series(MIN(txn_date),MAX(txn_date),'1 day'::interval)::date AS dt FROM transactions) SELECT dt AS missing_date FROM date_range WHERE dt NOT IN(SELECT DISTINCT txn_date FROM transactions) ORDER BY dt;","company":"Uber","topic":"Recursive CTE","hints":["Generate a complete date series using generate_series().","LEFT JOIN or NOT IN to find dates with no transactions.","The range should span from MIN to MAX transaction date."]},
  {"id":"q29","difficulty":"Medium","title":"Monthly Cumulative Reset","description":"Compute cumulative spending per active user, resetting at the start of each month.","schema":"TABLE spending (user_id INT, spend_date DATE, amount DECIMAL, status VARCHAR)","setupSql":"DROP TABLE IF EXISTS spending;CREATE TABLE spending(user_id INT,spend_date DATE,amount DECIMAL(10,2),status VARCHAR(20));INSERT INTO spending VALUES(1,'2023-01-05',100,'Active'),(1,'2023-01-15',200,'Active'),(1,'2023-01-25',150,'Active'),(1,'2023-02-03',300,'Active'),(1,'2023-02-18',250,'Active'),(1,'2023-03-10',180,'Active'),(2,'2023-01-08',90,'Active'),(2,'2023-01-20',110,'Active'),(2,'2023-02-05',200,'Active'),(2,'2023-02-22',160,'Active'),(3,'2023-01-12',300,'Inactive'),(3,'2023-01-28',400,'Inactive'),(4,'2023-01-03',50,'Active'),(4,'2023-01-10',80,'Active'),(4,'2023-02-14',120,'Active'),(4,'2023-02-28',90,'Active'),(4,'2023-03-05',200,'Active'),(4,'2023-03-20',150,'Active'),(5,'2023-01-18',170,'Active'),(5,'2023-02-10',220,'Active');","solutionSql":"SELECT user_id, spend_date, amount, SUM(amount) OVER(PARTITION BY user_id, DATE_TRUNC('month',spend_date) ORDER BY spend_date) AS monthly_cumulative FROM spending WHERE status='Active' ORDER BY user_id, spend_date;","company":"Amazon","topic":"Window Functions","hints":["PARTITION BY user_id AND the month to reset cumulative sum each month.","Use DATE_TRUNC(month, date) to group by month.","Filter for Active users with WHERE status = Active."]},
  {"id":"q30","difficulty":"Medium","title":"Returning Users Within 7 Days","description":"Find users who made a second purchase within 7 days of their first purchase.","schema":"TABLE purchases (purchase_id INT PK, user_id INT, purchase_date DATE)","setupSql":"DROP TABLE IF EXISTS purchases;CREATE TABLE purchases(purchase_id INT PRIMARY KEY,user_id INT,purchase_date DATE);INSERT INTO purchases VALUES(1,1,'2023-01-01'),(2,1,'2023-01-05'),(3,2,'2023-01-02'),(4,2,'2023-01-20'),(5,3,'2023-01-03'),(6,3,'2023-01-04'),(7,4,'2023-01-10'),(8,4,'2023-01-15'),(9,5,'2023-01-12'),(10,5,'2023-01-25'),(11,6,'2023-02-01'),(12,6,'2023-02-03'),(13,7,'2023-02-10'),(14,7,'2023-03-01'),(15,8,'2023-02-15'),(16,8,'2023-02-20'),(17,9,'2023-03-01'),(18,9,'2023-03-02'),(19,10,'2023-03-10'),(20,10,'2023-04-01');","solutionSql":"WITH first_purchase AS(SELECT user_id, MIN(purchase_date) AS first_date FROM purchases GROUP BY user_id) SELECT DISTINCT p.user_id FROM purchases p JOIN first_purchase f ON p.user_id=f.user_id WHERE p.purchase_date>f.first_date AND p.purchase_date<=f.first_date+7;","company":"Uber","topic":"Joins","hints":["Find each user first purchase date with MIN().","Join back and filter for a second purchase within 7 days.","Use DISTINCT to avoid duplicates from multiple repeat purchases."]},
  {"id":"q31","difficulty":"Medium","title":"3 Consecutive Month Buyers","description":"Find users who bought in 3 consecutive months.","schema":"TABLE purchases (user_id INT, purchase_date DATE)","setupSql":"DROP TABLE IF EXISTS purchases;CREATE TABLE purchases(user_id INT,purchase_date DATE);INSERT INTO purchases VALUES(1,'2023-01-15'),(1,'2023-02-10'),(1,'2023-03-20'),(1,'2023-05-05'),(2,'2023-01-05'),(2,'2023-02-14'),(2,'2023-04-20'),(3,'2023-03-10'),(3,'2023-04-15'),(3,'2023-05-20'),(3,'2023-06-25'),(4,'2023-01-08'),(4,'2023-03-12'),(4,'2023-05-18'),(5,'2023-06-01'),(5,'2023-07-15'),(5,'2023-08-20'),(6,'2023-02-10'),(6,'2023-03-15'),(6,'2023-05-20'),(7,'2023-09-01'),(7,'2023-10-10'),(7,'2023-11-15');","solutionSql":"WITH monthly AS(SELECT DISTINCT user_id, DATE_TRUNC('month',purchase_date)::date AS mth FROM purchases), numbered AS(SELECT user_id,mth,mth - (ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY mth)*INTERVAL '1 month')::date AS grp FROM monthly) SELECT DISTINCT user_id FROM numbered GROUP BY user_id,grp HAVING COUNT(*)>=3 ORDER BY user_id;","company":"Amazon","topic":"Aggregation","hints":["Extract distinct year-month per user.","Use the islands-and-gaps technique with ROW_NUMBER().","Group by the gap identifier and filter HAVING COUNT >= 3."]},
  {"id":"q32","difficulty":"Medium","title":"Investments in 2016","description":"Find the total investment amount and count of investments made in 2016, grouped by investor.","schema":"TABLE investments (inv_id INT PK, investor_id INT, amount DECIMAL, inv_date DATE)","setupSql":"DROP TABLE IF EXISTS investments;CREATE TABLE investments(inv_id INT PRIMARY KEY,investor_id INT,amount DECIMAL(10,2),inv_date DATE);INSERT INTO investments VALUES(1,1,50000,'2016-01-15'),(2,1,30000,'2016-06-20'),(3,2,100000,'2016-03-10'),(4,2,75000,'2016-09-05'),(5,2,25000,'2017-01-15'),(6,3,200000,'2016-02-28'),(7,3,150000,'2016-11-14'),(8,4,80000,'2015-12-01'),(9,4,60000,'2016-04-20'),(10,5,90000,'2016-07-30'),(11,5,110000,'2016-12-15'),(12,5,40000,'2017-03-10'),(13,6,300000,'2016-05-18'),(14,7,45000,'2016-08-22'),(15,7,55000,'2016-10-10'),(16,8,70000,'2015-06-01'),(17,8,120000,'2016-01-30'),(18,9,95000,'2016-11-25'),(19,10,180000,'2016-04-12'),(20,10,220000,'2016-09-30');","solutionSql":"SELECT investor_id, COUNT(*) AS num_investments, SUM(amount) AS total_invested FROM investments WHERE EXTRACT(YEAR FROM inv_date)=2016 GROUP BY investor_id ORDER BY total_invested DESC;","company":"Stripe","topic":"Subqueries","hints":["Filter WHERE year = 2016.","GROUP BY investor_id.","Use SUM(amount) and COUNT(*) for totals."]},
  {"id":"q33","difficulty":"Medium","title":"First vs Last Event","description":"For each entity, compare the first and last event values to see the change over time.","schema":"TABLE entity_events (entity_id INT, event_date DATE, metric_value DECIMAL)","setupSql":"DROP TABLE IF EXISTS entity_events;CREATE TABLE entity_events(entity_id INT,event_date DATE,metric_value DECIMAL(10,2));INSERT INTO entity_events VALUES(1,'2023-01-01',100),(1,'2023-02-15',120),(1,'2023-06-20',180),(1,'2023-12-31',250),(2,'2023-01-05',50),(2,'2023-04-10',65),(2,'2023-08-20',45),(2,'2023-11-15',80),(3,'2023-02-01',200),(3,'2023-05-15',220),(3,'2023-09-10',190),(3,'2023-12-20',300),(4,'2023-03-01',75),(4,'2023-07-15',90),(4,'2023-10-20',110),(5,'2023-01-10',500),(5,'2023-06-01',480),(5,'2023-12-15',550),(6,'2023-04-01',30),(6,'2023-08-10',45);","solutionSql":"WITH ranked AS(SELECT entity_id, event_date, metric_value, ROW_NUMBER() OVER(PARTITION BY entity_id ORDER BY event_date) AS rn_first, ROW_NUMBER() OVER(PARTITION BY entity_id ORDER BY event_date DESC) AS rn_last FROM entity_events) SELECT a.entity_id, a.metric_value AS first_value, b.metric_value AS last_value, b.metric_value-a.metric_value AS change FROM ranked a JOIN ranked b ON a.entity_id=b.entity_id WHERE a.rn_first=1 AND b.rn_last=1;","company":"Google","topic":"Window Functions","hints":["Use ROW_NUMBER() ascending and descending to find first and last events.","Self-join on entity_id where rn_first=1 and rn_last=1.","Calculate the difference for the change."]},
  {"id":"q34","difficulty":"Medium","title":"QoQ Sales Growth","description":"Calculate quarter-over-quarter sales growth percentage by territory.","schema":"TABLE sales (sale_id INT PK, territory VARCHAR, sale_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS sales;CREATE TABLE sales(sale_id INT PRIMARY KEY,territory VARCHAR(50),sale_date DATE,amount DECIMAL(10,2));INSERT INTO sales VALUES(1,'North','2023-01-15',1000),(2,'North','2023-02-20',1200),(3,'North','2023-04-10',1500),(4,'North','2023-05-18',1300),(5,'North','2023-07-22',1800),(6,'North','2023-08-14',1600),(7,'North','2023-10-05',2000),(8,'North','2023-11-20',2200),(9,'South','2023-01-08',800),(10,'South','2023-03-12',900),(11,'South','2023-04-25',1100),(12,'South','2023-06-30',1000),(13,'South','2023-07-15',1300),(14,'South','2023-09-20',1200),(15,'South','2023-10-10',1500),(16,'South','2023-12-05',1700),(17,'East','2023-02-14',600),(18,'East','2023-05-20',750),(19,'East','2023-08-10',900),(20,'East','2023-11-15',1100);","solutionSql":"WITH quarterly AS(SELECT territory, EXTRACT(QUARTER FROM sale_date) AS qtr, SUM(amount) AS total FROM sales WHERE EXTRACT(YEAR FROM sale_date)=2023 GROUP BY territory,qtr) SELECT territory, qtr, total, LAG(total) OVER(PARTITION BY territory ORDER BY qtr) AS prev_qtr, ROUND(100.0*(total-LAG(total) OVER(PARTITION BY territory ORDER BY qtr))/LAG(total) OVER(PARTITION BY territory ORDER BY qtr),2) AS growth_pct FROM quarterly ORDER BY territory,qtr;","company":"Amazon","topic":"Window Functions","hints":["Aggregate sales by territory and quarter.","Use LAG() to get previous quarter total.","Calculate growth as (current - previous) / previous * 100."]},
  {"id":"q35","difficulty":"Medium","title":"Delivery Correlation","description":"Measure the correlation between delivery distance and delivery time from aggregated metrics.","schema":"TABLE deliveries (delivery_id INT PK, distance_km DECIMAL, delivery_mins INT)","setupSql":"DROP TABLE IF EXISTS deliveries;CREATE TABLE deliveries(delivery_id INT PRIMARY KEY,distance_km DECIMAL(5,1),delivery_mins INT);INSERT INTO deliveries VALUES(1,2.5,15),(2,5.0,28),(3,1.2,10),(4,8.3,45),(5,3.7,22),(6,12.0,58),(7,0.8,8),(8,6.5,35),(9,4.2,25),(10,9.1,48),(11,7.8,42),(12,1.5,12),(13,10.5,52),(14,3.0,18),(15,15.0,72),(16,2.0,14),(17,6.0,32),(18,11.2,55),(19,4.8,27),(20,8.0,43);","solutionSql":"SELECT ROUND(CORR(distance_km, delivery_mins)::numeric, 4) AS correlation FROM deliveries;","company":"Uber","topic":"Aggregation","hints":["PostgreSQL has a built-in CORR() aggregate function.","CORR(x, y) returns the Pearson correlation coefficient.","Values close to 1 indicate strong positive correlation."]},
  {"id":"q36","difficulty":"Medium","title":"Session Active Time","description":"Pair session start and stop events to calculate total active time per user.","schema":"TABLE session_events (event_id INT PK, user_id INT, event_type VARCHAR, event_time TIMESTAMP)","setupSql":"DROP TABLE IF EXISTS session_events;CREATE TABLE session_events(event_id INT PRIMARY KEY,user_id INT,event_type VARCHAR(10),event_time TIMESTAMP);INSERT INTO session_events VALUES(1,1,'start','2023-01-01 09:00:00'),(2,1,'stop','2023-01-01 09:30:00'),(3,1,'start','2023-01-01 10:00:00'),(4,1,'stop','2023-01-01 11:00:00'),(5,2,'start','2023-01-01 08:00:00'),(6,2,'stop','2023-01-01 08:45:00'),(7,2,'start','2023-01-01 13:00:00'),(8,2,'stop','2023-01-01 14:30:00'),(9,3,'start','2023-01-01 10:00:00'),(10,3,'stop','2023-01-01 10:20:00'),(11,3,'start','2023-01-01 15:00:00'),(12,3,'stop','2023-01-01 16:00:00'),(13,4,'start','2023-01-01 07:00:00'),(14,4,'stop','2023-01-01 07:15:00'),(15,5,'start','2023-01-01 12:00:00'),(16,5,'stop','2023-01-01 13:00:00'),(17,5,'start','2023-01-01 14:00:00'),(18,5,'stop','2023-01-01 15:30:00'),(19,1,'start','2023-01-02 09:00:00'),(20,1,'stop','2023-01-02 10:00:00');","solutionSql":"WITH starts AS(SELECT user_id,event_time AS start_time,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_time) AS rn FROM session_events WHERE event_type='start'), stops AS(SELECT user_id,event_time AS stop_time,ROW_NUMBER() OVER(PARTITION BY user_id ORDER BY event_time) AS rn FROM session_events WHERE event_type='stop') SELECT s.user_id,SUM(EXTRACT(EPOCH FROM(st.stop_time-s.start_time))/60) AS total_active_mins FROM starts s JOIN stops st ON s.user_id=st.user_id AND s.rn=st.rn GROUP BY s.user_id ORDER BY s.user_id;","company":"Google","topic":"Window Functions","hints":["Separate start and stop events, assign ROW_NUMBER() to each.","Join on user_id and matching row numbers.","Calculate duration and SUM per user."]},
  {"id":"q37","difficulty":"Medium","title":"Customer Activity Rollup","description":"Roll up customer activity across purchases and site visits into a single summary.","schema":"TABLE purchases (customer_id INT, purchase_date DATE, amount DECIMAL)\nTABLE visits (customer_id INT, visit_date DATE, pages_viewed INT)","setupSql":"DROP TABLE IF EXISTS purchases;DROP TABLE IF EXISTS visits;CREATE TABLE purchases(customer_id INT,purchase_date DATE,amount DECIMAL(10,2));CREATE TABLE visits(customer_id INT,visit_date DATE,pages_viewed INT);INSERT INTO purchases VALUES(1,'2023-01-05',100),(1,'2023-02-10',200),(1,'2023-03-15',150),(2,'2023-01-20',300),(2,'2023-04-10',250),(3,'2023-02-05',180),(3,'2023-02-20',120),(3,'2023-03-10',200),(4,'2023-01-15',400),(5,'2023-03-01',90);INSERT INTO visits VALUES(1,'2023-01-01',5),(1,'2023-01-10',3),(1,'2023-02-05',8),(2,'2023-01-15',4),(2,'2023-02-20',6),(2,'2023-03-10',2),(3,'2023-01-08',7),(3,'2023-03-25',4),(4,'2023-01-10',10),(4,'2023-02-15',8),(4,'2023-03-20',6),(5,'2023-01-05',2),(5,'2023-02-10',3);","solutionSql":"WITH purchase_summary AS(SELECT customer_id,COUNT(*) AS total_purchases,SUM(amount) AS total_spent FROM purchases GROUP BY customer_id), visit_summary AS(SELECT customer_id,COUNT(*) AS total_visits,SUM(pages_viewed) AS total_pages FROM visits GROUP BY customer_id) SELECT COALESCE(p.customer_id,v.customer_id) AS customer_id,COALESCE(total_purchases,0) AS purchases,COALESCE(total_spent,0) AS spent,COALESCE(total_visits,0) AS visits,COALESCE(total_pages,0) AS pages FROM purchase_summary p FULL OUTER JOIN visit_summary v ON p.customer_id=v.customer_id ORDER BY customer_id;","company":"Amazon","topic":"CASE & Logic","hints":["Summarize purchases and visits separately in CTEs.","Use FULL OUTER JOIN to include customers with only purchases or only visits.","COALESCE handles NULLs for customers missing from one side."]},
  {"id":"q38","difficulty":"Medium","title":"Repeat Product Buyers","description":"Identify users who bought the same product on different days.","schema":"TABLE orders (order_id INT PK, user_id INT, product_id INT, order_date DATE)","setupSql":"DROP TABLE IF EXISTS orders;CREATE TABLE orders(order_id INT PRIMARY KEY,user_id INT,product_id INT,order_date DATE);INSERT INTO orders VALUES(1,1,101,'2023-01-01'),(2,1,101,'2023-01-01'),(3,1,101,'2023-02-15'),(4,1,102,'2023-01-10'),(5,2,101,'2023-01-05'),(6,2,101,'2023-03-20'),(7,2,103,'2023-02-10'),(8,3,102,'2023-01-15'),(9,3,102,'2023-01-15'),(10,3,103,'2023-02-20'),(11,4,101,'2023-01-20'),(12,4,102,'2023-02-25'),(13,4,102,'2023-03-10'),(14,5,103,'2023-01-25'),(15,5,104,'2023-02-28'),(16,5,104,'2023-03-15'),(17,6,101,'2023-02-01'),(18,6,102,'2023-02-05'),(19,7,103,'2023-03-01'),(20,7,103,'2023-03-01');","solutionSql":"SELECT user_id, product_id, COUNT(DISTINCT order_date) AS different_days FROM orders GROUP BY user_id, product_id HAVING COUNT(DISTINCT order_date)>1 ORDER BY user_id, product_id;","company":"Amazon","topic":"Window Functions","hints":["GROUP BY user_id and product_id.","Use COUNT(DISTINCT order_date) to count unique purchase days.","HAVING COUNT(DISTINCT order_date) > 1 finds repeat purchases on different days."]},
  {"id":"q39","difficulty":"Hard","title":"Consecutive Empty Seats","description":"Find groups of three or more consecutive empty seats in a cinema.","schema":"TABLE cinema (seat_id INT PK, is_empty BOOLEAN)","setupSql":"DROP TABLE IF EXISTS cinema;CREATE TABLE cinema(seat_id INT PRIMARY KEY,is_empty BOOLEAN);INSERT INTO cinema VALUES(1,true),(2,true),(3,true),(4,false),(5,true),(6,true),(7,true),(8,true),(9,false),(10,true),(11,false),(12,true),(13,true),(14,true),(15,false),(16,true),(17,false),(18,true),(19,true),(20,true),(21,true),(22,true),(23,false),(24,true),(25,false);","solutionSql":"WITH groups AS(SELECT seat_id, is_empty, seat_id - ROW_NUMBER() OVER(ORDER BY seat_id) AS grp FROM cinema WHERE is_empty=true), sized AS(SELECT seat_id, grp, COUNT(*) OVER(PARTITION BY grp) AS grp_size FROM groups) SELECT seat_id FROM sized WHERE grp_size>=3 ORDER BY seat_id;","company":"Uber","topic":"Window Functions","hints":["Filter for empty seats only.","Use the islands-and-gaps technique: seat_id - ROW_NUMBER() groups consecutive seats.","Keep groups with COUNT(*) >= 3."]},
  {"id":"q40","difficulty":"Hard","title":"Top Medalists by Event","description":"Find the top medalist (most gold medals) per event and gender.","schema":"TABLE medals (athlete VARCHAR, event VARCHAR, gender VARCHAR, medal VARCHAR)","setupSql":"DROP TABLE IF EXISTS medals;CREATE TABLE medals(athlete VARCHAR(50),event VARCHAR(50),gender VARCHAR(10),medal VARCHAR(10));INSERT INTO medals VALUES('Alice','100m','F','Gold'),('Alice','100m','F','Gold'),('Alice','100m','F','Silver'),('Beth','100m','F','Gold'),('Beth','100m','F','Gold'),('Beth','100m','F','Gold'),('Carol','200m','F','Gold'),('Carol','200m','F','Gold'),('Diana','200m','F','Gold'),('Diana','200m','F','Gold'),('Diana','200m','F','Gold'),('Ed','100m','M','Gold'),('Ed','100m','M','Gold'),('Ed','100m','M','Gold'),('Ed','100m','M','Gold'),('Frank','100m','M','Gold'),('Frank','100m','M','Gold'),('George','200m','M','Gold'),('George','200m','M','Gold'),('George','200m','M','Gold'),('Hank','200m','M','Gold'),('Hank','200m','M','Gold');","solutionSql":"WITH gold_counts AS(SELECT athlete,event,gender,COUNT(*) AS golds FROM medals WHERE medal='Gold' GROUP BY athlete,event,gender), ranked AS(SELECT *,RANK() OVER(PARTITION BY event,gender ORDER BY golds DESC) AS rnk FROM gold_counts) SELECT athlete,event,gender,golds FROM ranked WHERE rnk=1 ORDER BY event,gender;","company":"Google","topic":"Window Functions","hints":["Count gold medals per athlete, event, and gender.","Use RANK() partitioned by event and gender.","Filter for rank = 1 to get the top medalist(s)."]},
  {"id":"q41","difficulty":"Hard","title":"Campaign Responders","description":"Find users who made a purchase after a campaign, excluding those whose first-ever purchase was on the campaign day itself.","schema":"TABLE campaigns (campaign_id INT, user_id INT, campaign_date DATE)\nTABLE purchases (purchase_id INT PK, user_id INT, purchase_date DATE)","setupSql":"DROP TABLE IF EXISTS purchases;DROP TABLE IF EXISTS campaigns;CREATE TABLE campaigns(campaign_id INT,user_id INT,campaign_date DATE);CREATE TABLE purchases(purchase_id INT PRIMARY KEY,user_id INT,purchase_date DATE);INSERT INTO campaigns VALUES(1,1,'2023-01-10'),(2,2,'2023-01-10'),(3,3,'2023-01-10'),(4,4,'2023-01-10'),(5,5,'2023-01-10'),(6,6,'2023-01-10'),(7,7,'2023-01-10'),(8,8,'2023-01-10');INSERT INTO purchases VALUES(1,1,'2023-01-10',100),(2,1,'2023-01-15'),(3,2,'2023-01-12'),(4,3,'2023-01-10'),(5,3,'2023-01-18'),(6,4,'2023-01-05'),(7,4,'2023-01-12'),(8,5,'2023-01-20'),(9,6,'2023-01-08'),(10,6,'2023-01-14'),(11,7,'2023-01-10'),(12,8,'2023-01-25');","solutionSql":"WITH first_purchase AS(SELECT user_id,MIN(purchase_date) AS first_date FROM purchases GROUP BY user_id), campaign_responders AS(SELECT DISTINCT c.user_id FROM campaigns c JOIN purchases p ON c.user_id=p.user_id AND p.purchase_date>c.campaign_date) SELECT cr.user_id FROM campaign_responders cr JOIN first_purchase fp ON cr.user_id=fp.user_id WHERE fp.first_date<>(SELECT campaign_date FROM campaigns LIMIT 1);","company":"Amazon","topic":"Subqueries","hints":["Identify users who purchased AFTER the campaign date.","Find each user first-ever purchase date.","Exclude users whose first purchase was on the campaign day."]},
  {"id":"q42","difficulty":"Hard","title":"Increasing Ride Distance","description":"Find users whose monthly average ride distance is strictly increasing for 4 consecutive months.","schema":"TABLE rides (ride_id INT PK, user_id INT, ride_date DATE, distance_km DECIMAL)","setupSql":"DROP TABLE IF EXISTS rides;CREATE TABLE rides(ride_id INT PRIMARY KEY,user_id INT,ride_date DATE,distance_km DECIMAL(5,1));INSERT INTO rides VALUES(1,1,'2023-01-05',5.0),(2,1,'2023-01-15',6.0),(3,1,'2023-02-10',7.5),(4,1,'2023-02-20',8.0),(5,1,'2023-03-05',9.0),(6,1,'2023-03-15',10.0),(7,1,'2023-04-10',11.0),(8,1,'2023-04-20',12.0),(9,2,'2023-01-05',10.0),(10,2,'2023-02-10',8.0),(11,2,'2023-03-15',12.0),(12,2,'2023-04-20',15.0),(13,3,'2023-03-01',3.0),(14,3,'2023-04-01',4.0),(15,3,'2023-05-01',5.0),(16,3,'2023-06-01',6.0),(17,3,'2023-07-01',7.0),(18,4,'2023-01-10',20.0),(19,4,'2023-02-10',22.0),(20,4,'2023-03-10',21.0);","solutionSql":"WITH monthly_avg AS(SELECT user_id, DATE_TRUNC('month',ride_date)::date AS mth, AVG(distance_km) AS avg_dist FROM rides GROUP BY user_id,mth), with_prev AS(SELECT *, LAG(avg_dist) OVER(PARTITION BY user_id ORDER BY mth) AS prev_avg, LAG(mth) OVER(PARTITION BY user_id ORDER BY mth) AS prev_mth FROM monthly_avg), increasing AS(SELECT *, CASE WHEN avg_dist>prev_avg AND mth=prev_mth+INTERVAL '1 month' THEN 0 ELSE 1 END AS reset FROM with_prev), groups AS(SELECT *, SUM(reset) OVER(PARTITION BY user_id ORDER BY mth) AS grp FROM increasing) SELECT DISTINCT user_id FROM groups GROUP BY user_id,grp HAVING COUNT(*)>=4;","company":"Uber","topic":"Window Functions","hints":["Compute monthly average distance per user.","Use LAG() to compare with previous month.","Track consecutive increasing months using a running group counter."]},
  {"id":"q43","difficulty":"Hard","title":"Monthly Returning Users","description":"Calculate the percentage of returning users (users who were also active in the previous month) for each month.","schema":"TABLE user_activity (user_id INT, activity_date DATE)","setupSql":"DROP TABLE IF EXISTS user_activity;CREATE TABLE user_activity(user_id INT,activity_date DATE);INSERT INTO user_activity VALUES(1,'2023-01-05'),(1,'2023-02-10'),(1,'2023-03-15'),(2,'2023-01-08'),(2,'2023-02-12'),(3,'2023-01-20'),(3,'2023-03-25'),(4,'2023-02-05'),(4,'2023-03-10'),(4,'2023-04-15'),(5,'2023-01-15'),(5,'2023-02-20'),(5,'2023-03-25'),(5,'2023-04-30'),(6,'2023-03-01'),(6,'2023-04-05'),(7,'2023-01-10'),(8,'2023-02-15'),(8,'2023-03-20'),(9,'2023-04-10'),(10,'2023-01-25'),(10,'2023-02-28');","solutionSql":"WITH monthly_users AS(SELECT DISTINCT user_id, DATE_TRUNC('month',activity_date)::date AS mth FROM user_activity), with_prev AS(SELECT curr.mth, COUNT(DISTINCT curr.user_id) AS total_users, COUNT(DISTINCT prev.user_id) AS returning_users FROM monthly_users curr LEFT JOIN monthly_users prev ON curr.user_id=prev.user_id AND curr.mth=prev.mth+INTERVAL '1 month' GROUP BY curr.mth) SELECT mth, total_users, returning_users, ROUND(100.0*returning_users/total_users,2) AS return_pct FROM with_prev ORDER BY mth;","company":"Meta","topic":"Window Functions","hints":["Get distinct users per month.","Self-join current month to previous month on user_id.","returning_users / total_users * 100 gives the percentage."]},
  {"id":"q44","difficulty":"Hard","title":"Price Anomaly Detection","description":"Detect price anomalies where the daily price exceeds 2x the 7-day moving average.","schema":"TABLE prices (price_date DATE PK, price DECIMAL)","setupSql":"DROP TABLE IF EXISTS prices;CREATE TABLE prices(price_date DATE PRIMARY KEY,price DECIMAL(10,2));INSERT INTO prices VALUES('2023-01-01',100),('2023-01-02',102),('2023-01-03',98),('2023-01-04',105),('2023-01-05',101),('2023-01-06',99),('2023-01-07',103),('2023-01-08',250),('2023-01-09',104),('2023-01-10',97),('2023-01-11',106),('2023-01-12',100),('2023-01-13',98),('2023-01-14',102),('2023-01-15',300),('2023-01-16',105),('2023-01-17',99),('2023-01-18',101),('2023-01-19',103),('2023-01-20',97);","solutionSql":"WITH with_avg AS(SELECT price_date, price, AVG(price) OVER(ORDER BY price_date ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING) AS moving_avg_7 FROM prices) SELECT price_date, price, ROUND(moving_avg_7::numeric,2) AS moving_avg FROM with_avg WHERE price>2*moving_avg_7;","company":"Stripe","topic":"Window Functions","hints":["Calculate 7-day moving average using ROWS BETWEEN 7 PRECEDING AND 1 PRECEDING.","Compare each day price against 2x the moving average.","Use 1 PRECEDING (not CURRENT ROW) to avoid including todays price in its own average."]},
  {"id":"q45","difficulty":"Hard","title":"Funnel Drop-Off Rates","description":"Calculate the add-to-cart → checkout → purchase funnel with step-by-step drop-off rates.","schema":"TABLE funnel_events (user_id INT, event_type VARCHAR, event_date DATE)","setupSql":"DROP TABLE IF EXISTS funnel_events;CREATE TABLE funnel_events(user_id INT,event_type VARCHAR(20),event_date DATE);INSERT INTO funnel_events VALUES(1,'add_to_cart','2023-01-01'),(1,'checkout','2023-01-01'),(1,'purchase','2023-01-01'),(2,'add_to_cart','2023-01-02'),(2,'checkout','2023-01-02'),(3,'add_to_cart','2023-01-03'),(3,'checkout','2023-01-03'),(3,'purchase','2023-01-03'),(4,'add_to_cart','2023-01-04'),(5,'add_to_cart','2023-01-05'),(5,'checkout','2023-01-05'),(5,'purchase','2023-01-05'),(6,'add_to_cart','2023-01-06'),(6,'checkout','2023-01-06'),(7,'add_to_cart','2023-01-07'),(8,'add_to_cart','2023-01-08'),(8,'checkout','2023-01-08'),(8,'purchase','2023-01-08'),(9,'add_to_cart','2023-01-09'),(9,'checkout','2023-01-09'),(10,'add_to_cart','2023-01-10'),(11,'add_to_cart','2023-01-11'),(11,'checkout','2023-01-11'),(11,'purchase','2023-01-11'),(12,'add_to_cart','2023-01-12'),(13,'add_to_cart','2023-01-13'),(13,'checkout','2023-01-13'),(14,'add_to_cart','2023-01-14'),(15,'add_to_cart','2023-01-15'),(15,'checkout','2023-01-15'),(15,'purchase','2023-01-15'),(16,'add_to_cart','2023-01-16'),(17,'add_to_cart','2023-01-17'),(17,'checkout','2023-01-17'),(18,'add_to_cart','2023-01-18'),(19,'add_to_cart','2023-01-19'),(19,'checkout','2023-01-19'),(19,'purchase','2023-01-19'),(20,'add_to_cart','2023-01-20');","solutionSql":"WITH counts AS(SELECT COUNT(DISTINCT CASE WHEN event_type='add_to_cart' THEN user_id END) AS cart, COUNT(DISTINCT CASE WHEN event_type='checkout' THEN user_id END) AS checkout, COUNT(DISTINCT CASE WHEN event_type='purchase' THEN user_id END) AS purchase FROM funnel_events) SELECT cart, checkout, purchase, ROUND(100.0*checkout/cart,2) AS cart_to_checkout_pct, ROUND(100.0*purchase/checkout,2) AS checkout_to_purchase_pct, ROUND(100.0*(cart-checkout)/cart,2) AS cart_dropoff_pct, ROUND(100.0*(checkout-purchase)/checkout,2) AS checkout_dropoff_pct FROM counts;","company":"Amazon","topic":"Window Functions","hints":["Count distinct users at each funnel step using conditional aggregation.","Conversion rate = next_step / current_step * 100.","Drop-off rate = (current - next) / current * 100."]},
  {"id":"q46","difficulty":"Hard","title":"RFM Segmentation","description":"Build RFM (Recency, Frequency, Monetary) segmentation using SQL alone. Score each dimension 1-5.","schema":"TABLE orders (order_id INT PK, customer_id INT, order_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS orders;CREATE TABLE orders(order_id INT PRIMARY KEY,customer_id INT,order_date DATE,amount DECIMAL(10,2));INSERT INTO orders VALUES(1,1,'2023-12-20',500),(2,1,'2023-11-15',300),(3,1,'2023-10-01',200),(4,2,'2023-12-25',1000),(5,2,'2023-12-20',800),(6,2,'2023-11-10',600),(7,2,'2023-09-05',400),(8,2,'2023-07-15',300),(9,3,'2023-06-01',150),(10,4,'2023-12-28',2000),(11,4,'2023-12-15',1500),(12,5,'2023-03-10',100),(13,5,'2023-01-05',80),(14,6,'2023-12-30',50),(15,7,'2023-08-20',900),(16,7,'2023-07-10',700),(17,7,'2023-06-05',500),(18,8,'2023-11-25',250),(19,8,'2023-10-15',180),(20,9,'2023-12-01',350);","solutionSql":"WITH rfm AS(SELECT customer_id, MAX(order_date) AS last_order, COUNT(*) AS frequency, SUM(amount) AS monetary FROM orders GROUP BY customer_id), scored AS(SELECT customer_id, NTILE(5) OVER(ORDER BY last_order) AS r_score, NTILE(5) OVER(ORDER BY frequency) AS f_score, NTILE(5) OVER(ORDER BY monetary) AS m_score FROM rfm) SELECT *, r_score+f_score+m_score AS rfm_total FROM scored ORDER BY rfm_total DESC;","company":"Amazon","topic":"Window Functions","hints":["R = recency (MAX order_date), F = frequency (COUNT), M = monetary (SUM).","Use NTILE(5) to score each dimension 1-5.","Higher total RFM score = more valuable customer."]},
  {"id":"q47","difficulty":"Hard","title":"Peak Concurrency","description":"Find the maximum number of active users at any minute-level point in time.","schema":"TABLE sessions (session_id INT PK, user_id INT, start_time TIMESTAMP, end_time TIMESTAMP)","setupSql":"DROP TABLE IF EXISTS sessions;CREATE TABLE sessions(session_id INT PRIMARY KEY,user_id INT,start_time TIMESTAMP,end_time TIMESTAMP);INSERT INTO sessions VALUES(1,1,'2023-01-01 09:00','2023-01-01 09:30'),(2,2,'2023-01-01 09:10','2023-01-01 09:45'),(3,3,'2023-01-01 09:15','2023-01-01 09:50'),(4,4,'2023-01-01 09:20','2023-01-01 10:00'),(5,5,'2023-01-01 09:25','2023-01-01 09:35'),(6,6,'2023-01-01 09:30','2023-01-01 10:15'),(7,7,'2023-01-01 09:40','2023-01-01 10:10'),(8,8,'2023-01-01 10:00','2023-01-01 10:30'),(9,9,'2023-01-01 10:05','2023-01-01 10:20'),(10,10,'2023-01-01 10:10','2023-01-01 10:40'),(11,1,'2023-01-01 10:30','2023-01-01 11:00'),(12,2,'2023-01-01 10:35','2023-01-01 11:15'),(13,3,'2023-01-01 10:40','2023-01-01 11:10'),(14,4,'2023-01-01 10:45','2023-01-01 11:20'),(15,5,'2023-01-01 10:50','2023-01-01 11:05');","solutionSql":"WITH events AS(SELECT start_time AS ts, 1 AS delta FROM sessions UNION ALL SELECT end_time, -1 FROM sessions), running AS(SELECT ts, SUM(delta) OVER(ORDER BY ts, delta) AS concurrent FROM events) SELECT MAX(concurrent) AS peak_concurrency FROM running;","company":"Uber","topic":"Window Functions","hints":["+1 at each session start, -1 at each session end.","Running SUM of deltas gives concurrent users at each point.","MAX of the running sum is the peak concurrency."]},
  {"id":"q48","difficulty":"Hard","title":"Second Highest Marks","description":"Find the second highest and second lowest marks in each subject.","schema":"TABLE marks (student_id INT, subject VARCHAR, score INT)","setupSql":"DROP TABLE IF EXISTS marks;CREATE TABLE marks(student_id INT,subject VARCHAR(50),score INT);INSERT INTO marks VALUES(1,'Math',95),(2,'Math',88),(3,'Math',92),(4,'Math',78),(5,'Math',85),(6,'Math',91),(7,'Science',90),(8,'Science',82),(9,'Science',95),(10,'Science',76),(11,'Science',88),(12,'Science',93),(13,'English',85),(14,'English',92),(15,'English',78),(16,'English',88),(17,'English',95),(18,'English',82),(19,'Math',95),(20,'Science',90);","solutionSql":"WITH ranked AS(SELECT subject,score, DENSE_RANK() OVER(PARTITION BY subject ORDER BY score DESC) AS rnk_high, DENSE_RANK() OVER(PARTITION BY subject ORDER BY score ASC) AS rnk_low FROM marks) SELECT DISTINCT subject, (SELECT DISTINCT score FROM ranked r2 WHERE r2.subject=ranked.subject AND r2.rnk_high=2) AS second_highest, (SELECT DISTINCT score FROM ranked r3 WHERE r3.subject=ranked.subject AND r3.rnk_low=2) AS second_lowest FROM ranked ORDER BY subject;","company":"Google","topic":"Window Functions","hints":["Use DENSE_RANK() descending for highest, ascending for lowest.","Filter for rank = 2 to get the second position.","DENSE_RANK handles ties correctly."]},
  {"id":"q49","difficulty":"Hard","title":"Microsoft to Google","description":"Count users whose next employer after Microsoft was Google.","schema":"TABLE employment (user_id INT, company VARCHAR, start_date DATE)","setupSql":"DROP TABLE IF EXISTS employment;CREATE TABLE employment(user_id INT,company VARCHAR(50),start_date DATE);INSERT INTO employment VALUES(1,'Apple','2018-01-01'),(1,'Microsoft','2019-06-01'),(1,'Google','2021-03-01'),(2,'Microsoft','2017-01-01'),(2,'Amazon','2019-06-01'),(3,'Microsoft','2018-06-01'),(3,'Google','2020-01-01'),(4,'Google','2017-01-01'),(4,'Microsoft','2019-01-01'),(4,'Meta','2021-06-01'),(5,'Microsoft','2016-01-01'),(5,'Google','2018-06-01'),(5,'Apple','2021-01-01'),(6,'Amazon','2017-06-01'),(6,'Microsoft','2019-06-01'),(6,'Google','2021-06-01'),(7,'Microsoft','2018-01-01'),(7,'Uber','2020-01-01'),(8,'Google','2017-01-01'),(8,'Microsoft','2019-06-01'),(8,'Google','2022-01-01'),(9,'Microsoft','2020-01-01'),(10,'Microsoft','2019-01-01'),(10,'Google','2021-01-01');","solutionSql":"WITH with_next AS(SELECT user_id, company, LEAD(company) OVER(PARTITION BY user_id ORDER BY start_date) AS next_company FROM employment) SELECT COUNT(DISTINCT user_id) AS ms_to_google_count FROM with_next WHERE company='Microsoft' AND next_company='Google';","company":"LinkedIn","topic":"Joins","hints":["Use LEAD() to get the next company for each user chronologically.","Filter WHERE company = Microsoft AND next_company = Google.","COUNT DISTINCT user_id for the final count."]},
  {"id":"q50","difficulty":"Easy","title":"Customers Who Never Order","description":"Find all customers who have never placed an order. Return the customer name.","schema":"TABLE customers (id INT PK, name VARCHAR)\nTABLE orders (id INT PK, customer_id INT)","setupSql":"DROP TABLE IF EXISTS orders;DROP TABLE IF EXISTS customers;CREATE TABLE customers(id INT PRIMARY KEY,name VARCHAR(50));CREATE TABLE orders(id INT PRIMARY KEY,customer_id INT);INSERT INTO customers VALUES(1,'Alice'),(2,'Bob'),(3,'Carol'),(4,'Dave'),(5,'Eve'),(6,'Frank'),(7,'Grace'),(8,'Hank'),(9,'Ivy'),(10,'Jack'),(11,'Kate'),(12,'Leo'),(13,'Mia'),(14,'Nate'),(15,'Olga'),(16,'Pete'),(17,'Quinn'),(18,'Rosa'),(19,'Sam'),(20,'Tina');INSERT INTO orders VALUES(1,1),(2,1),(3,3),(4,3),(5,5),(6,5),(7,7),(8,9),(9,9),(10,10),(11,12),(12,12),(13,14),(14,16),(15,18);","solutionSql":"SELECT c.name FROM customers c LEFT JOIN orders o ON c.id = o.customer_id WHERE o.id IS NULL ORDER BY c.name;","company":"Amazon","topic":"Joins","hints":["Use LEFT JOIN from customers to orders.","Filter WHERE o.id IS NULL to find unmatched customers.","Alternative: use NOT EXISTS or NOT IN subquery."]},
  {"id":"q51","difficulty":"Easy","title":"Rising Temperature","description":"Find all dates where the temperature was higher than the previous day. Return the id of the warmer day.","schema":"TABLE weather (id INT PK, record_date DATE, temperature INT)","setupSql":"DROP TABLE IF EXISTS weather;CREATE TABLE weather(id INT PRIMARY KEY,record_date DATE,temperature INT);INSERT INTO weather VALUES(1,'2023-01-01',10),(2,'2023-01-02',25),(3,'2023-01-03',20),(4,'2023-01-04',30),(5,'2023-01-05',28),(6,'2023-01-06',35),(7,'2023-01-07',32),(8,'2023-01-08',40),(9,'2023-01-09',38),(10,'2023-01-10',42),(11,'2023-01-11',15),(12,'2023-01-12',22),(13,'2023-01-13',18),(14,'2023-01-14',27),(15,'2023-01-15',33),(16,'2023-01-16',29),(17,'2023-01-17',36),(18,'2023-01-18',31),(19,'2023-01-19',39),(20,'2023-01-20',45);","solutionSql":"SELECT w1.id FROM weather w1 JOIN weather w2 ON w1.record_date = w2.record_date + 1 WHERE w1.temperature > w2.temperature;","company":"Google","topic":"Joins","hints":["Self-join weather to itself matching consecutive dates.","w1.record_date = w2.record_date + 1 links today to yesterday.","Alternative: use LAG() window function to get previous day temp."]},
  {"id":"q52","difficulty":"Medium","title":"Consecutive Numbers","description":"Find all numbers that appear at least three times consecutively in the logs table.","schema":"TABLE logs (id INT PK, num INT)","setupSql":"DROP TABLE IF EXISTS logs;CREATE TABLE logs(id INT PRIMARY KEY,num INT);INSERT INTO logs VALUES(1,1),(2,1),(3,1),(4,2),(5,1),(6,2),(7,2),(8,2),(9,2),(10,3),(11,3),(12,3),(13,4),(14,4),(15,5),(16,5),(17,5),(18,5),(19,5),(20,6),(21,6),(22,7),(23,7),(24,7),(25,8);","solutionSql":"SELECT DISTINCT l1.num AS consecutive_num FROM logs l1 JOIN logs l2 ON l1.id = l2.id - 1 JOIN logs l3 ON l2.id = l3.id - 1 WHERE l1.num = l2.num AND l2.num = l3.num;","company":"Amazon","topic":"Window Functions","hints":["Self-join the table three times on consecutive IDs.","Check l1.num = l2.num = l3.num for three in a row.","Alternative: use LEAD() to peek at the next two values."]},
  {"id":"q53","difficulty":"Medium","title":"Department Top 3 Salaries","description":"Find employees who earn one of the top three unique salaries in their department.","schema":"TABLE employees (id INT PK, name VARCHAR, salary INT, dept_id INT)\nTABLE departments (id INT PK, name VARCHAR)","setupSql":"DROP TABLE IF EXISTS employees;DROP TABLE IF EXISTS departments;CREATE TABLE departments(id INT PRIMARY KEY,name VARCHAR(50));CREATE TABLE employees(id INT PRIMARY KEY,name VARCHAR(50),salary INT,dept_id INT);INSERT INTO departments VALUES(1,'Engineering'),(2,'Sales'),(3,'Marketing');INSERT INTO employees VALUES(1,'Alice',95000,1),(2,'Bob',90000,1),(3,'Carol',95000,1),(4,'Dave',85000,1),(5,'Eve',80000,1),(6,'Frank',75000,2),(7,'Grace',80000,2),(8,'Hank',80000,2),(9,'Ivy',70000,2),(10,'Jack',65000,2),(11,'Kate',60000,3),(12,'Leo',55000,3),(13,'Mia',60000,3),(14,'Nate',50000,3),(15,'Olga',45000,3),(16,'Pete',88000,1),(17,'Quinn',72000,2),(18,'Rosa',58000,3),(19,'Sam',92000,1),(20,'Tina',68000,2);","solutionSql":"WITH ranked AS (SELECT e.name AS employee, d.name AS department, e.salary, DENSE_RANK() OVER(PARTITION BY e.dept_id ORDER BY e.salary DESC) AS rnk FROM employees e JOIN departments d ON e.dept_id = d.id) SELECT department, employee, salary FROM ranked WHERE rnk <= 3 ORDER BY department, salary DESC;","company":"Meta","topic":"Window Functions","hints":["Use DENSE_RANK() OVER(PARTITION BY department ORDER BY salary DESC).","Filter for rank <= 3 to get top 3 unique salary levels.","DENSE_RANK handles ties — employees with the same salary get the same rank."]},
  {"id":"q54","difficulty":"Medium","title":"Pivot: Monthly Sales Report","description":"Reshape the sales data to show each product as a row with monthly totals as columns (Jan through Jun).","schema":"TABLE sales (sale_id INT PK, product VARCHAR, sale_month INT, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS sales;CREATE TABLE sales(sale_id INT PRIMARY KEY,product VARCHAR(50),sale_month INT,amount DECIMAL(10,2));INSERT INTO sales VALUES(1,'Widget',1,1500),(2,'Widget',2,1800),(3,'Widget',3,2100),(4,'Widget',4,1900),(5,'Widget',5,2300),(6,'Widget',6,2000),(7,'Gadget',1,3000),(8,'Gadget',2,2800),(9,'Gadget',3,3200),(10,'Gadget',4,3500),(11,'Gadget',5,3100),(12,'Gadget',6,3800),(13,'Tool',1,800),(14,'Tool',2,950),(15,'Tool',3,1100),(16,'Tool',4,900),(17,'Tool',5,1050),(18,'Tool',6,1200),(19,'Device',1,5000),(20,'Device',3,4800),(21,'Device',5,5200),(22,'Sensor',2,600),(23,'Sensor',4,750),(24,'Sensor',6,700);","solutionSql":"SELECT product, COALESCE(SUM(CASE WHEN sale_month=1 THEN amount END),0) AS jan, COALESCE(SUM(CASE WHEN sale_month=2 THEN amount END),0) AS feb, COALESCE(SUM(CASE WHEN sale_month=3 THEN amount END),0) AS mar, COALESCE(SUM(CASE WHEN sale_month=4 THEN amount END),0) AS apr, COALESCE(SUM(CASE WHEN sale_month=5 THEN amount END),0) AS may, COALESCE(SUM(CASE WHEN sale_month=6 THEN amount END),0) AS jun FROM sales GROUP BY product ORDER BY product;","company":"Google","topic":"Aggregation","hints":["Use SUM(CASE WHEN month = X THEN amount END) for each column.","GROUP BY product to get one row per product.","COALESCE(..., 0) handles months with no sales."]},
  {"id":"q55","difficulty":"Medium","title":"MoM Active User Growth","description":"Calculate the month-over-month growth rate of active users as a percentage.","schema":"TABLE user_activity (user_id INT, activity_date DATE)","setupSql":"DROP TABLE IF EXISTS user_activity;CREATE TABLE user_activity(user_id INT,activity_date DATE);INSERT INTO user_activity VALUES(1,'2023-01-05'),(2,'2023-01-10'),(3,'2023-01-15'),(1,'2023-01-20'),(4,'2023-01-25'),(5,'2023-02-01'),(1,'2023-02-05'),(2,'2023-02-10'),(6,'2023-02-15'),(7,'2023-02-20'),(8,'2023-02-25'),(1,'2023-03-01'),(3,'2023-03-05'),(5,'2023-03-10'),(9,'2023-03-15'),(10,'2023-03-20'),(11,'2023-03-25'),(12,'2023-03-28'),(1,'2023-04-01'),(2,'2023-04-05'),(5,'2023-04-10'),(13,'2023-04-15'),(14,'2023-04-20'),(15,'2023-04-25'),(16,'2023-04-28'),(17,'2023-04-30');","solutionSql":"WITH monthly AS (SELECT DATE_TRUNC('month', activity_date)::date AS mth, COUNT(DISTINCT user_id) AS active_users FROM user_activity GROUP BY mth) SELECT mth, active_users, LAG(active_users) OVER(ORDER BY mth) AS prev_month, ROUND(100.0 * (active_users - LAG(active_users) OVER(ORDER BY mth)) / NULLIF(LAG(active_users) OVER(ORDER BY mth), 0), 2) AS mom_growth_pct FROM monthly ORDER BY mth;","company":"Meta","topic":"Window Functions","hints":["Count DISTINCT active users per month.","Use LAG() to get the previous month count.","Growth = (current - previous) / previous * 100. Use NULLIF to avoid division by zero."]},
  {"id":"q56","difficulty":"Medium","title":"Churned Users (90-Day Inactive)","description":"Find users who were active in Q1 (Jan-Mar) but have had no activity in the last 90 days from the most recent date in the dataset.","schema":"TABLE user_events (user_id INT, event_date DATE, event_type VARCHAR)","setupSql":"DROP TABLE IF EXISTS user_events;CREATE TABLE user_events(user_id INT,event_date DATE,event_type VARCHAR(20));INSERT INTO user_events VALUES(1,'2023-01-05','login'),(1,'2023-02-10','purchase'),(1,'2023-03-15','login'),(2,'2023-01-08','login'),(2,'2023-02-12','login'),(2,'2023-06-20','login'),(3,'2023-01-20','purchase'),(3,'2023-03-25','login'),(4,'2023-02-05','login'),(4,'2023-04-10','purchase'),(4,'2023-06-15','login'),(5,'2023-01-15','login'),(5,'2023-02-20','purchase'),(6,'2023-03-01','login'),(6,'2023-06-25','login'),(7,'2023-01-10','login'),(8,'2023-02-15','login'),(8,'2023-03-20','purchase'),(9,'2023-01-25','login'),(9,'2023-05-10','login'),(10,'2023-02-28','login'),(10,'2023-06-28','purchase');","solutionSql":"WITH q1_users AS (SELECT DISTINCT user_id FROM user_events WHERE event_date BETWEEN '2023-01-01' AND '2023-03-31'), last_activity AS (SELECT user_id, MAX(event_date) AS last_seen FROM user_events GROUP BY user_id), max_date AS (SELECT MAX(event_date) AS ref_date FROM user_events) SELECT q.user_id, la.last_seen FROM q1_users q JOIN last_activity la ON q.user_id = la.user_id CROSS JOIN max_date m WHERE la.last_seen < m.ref_date - 90 ORDER BY q.user_id;","company":"Amazon","topic":"Date Functions","hints":["Identify Q1 users with a date filter.","Find each user last activity date with MAX(event_date).","Compare last_seen against (max_date - 90 days) to find churned users."]},
  {"id":"q57","difficulty":"Medium","title":"Top N Products Per Category","description":"Find the top 2 products by total sales in each category.","schema":"TABLE products (product_id INT PK, product_name VARCHAR, category VARCHAR)\nTABLE sales (sale_id INT PK, product_id INT, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS sales;DROP TABLE IF EXISTS products;CREATE TABLE products(product_id INT PRIMARY KEY,product_name VARCHAR(50),category VARCHAR(50));CREATE TABLE sales(sale_id INT PRIMARY KEY,product_id INT,amount DECIMAL(10,2));INSERT INTO products VALUES(1,'iPhone','Electronics'),(2,'Galaxy','Electronics'),(3,'Pixel','Electronics'),(4,'iPad','Electronics'),(5,'Nike Air','Footwear'),(6,'Adidas Ultra','Footwear'),(7,'Puma RS','Footwear'),(8,'Desk Lamp','Home'),(9,'Sofa Set','Home'),(10,'Bookshelf','Home');INSERT INTO sales VALUES(1,1,999),(2,1,999),(3,1,999),(4,2,799),(5,2,799),(6,3,599),(7,4,499),(8,5,150),(9,5,150),(10,5,150),(11,6,180),(12,6,180),(13,7,120),(14,8,45),(15,8,45),(16,8,45),(17,9,800),(18,9,800),(19,10,200),(20,10,200);","solutionSql":"WITH product_totals AS (SELECT p.category, p.product_name, SUM(s.amount) AS total_sales FROM products p JOIN sales s ON p.product_id = s.product_id GROUP BY p.category, p.product_name), ranked AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY category ORDER BY total_sales DESC) AS rnk FROM product_totals) SELECT category, product_name, total_sales FROM ranked WHERE rnk <= 2 ORDER BY category, rnk;","company":"Amazon","topic":"Window Functions","hints":["Aggregate total sales per product with SUM and GROUP BY.","Use ROW_NUMBER() OVER(PARTITION BY category ORDER BY total_sales DESC).","Filter WHERE rnk <= 2 for the top 2 per category."]},
  {"id":"q58","difficulty":"Hard","title":"Cohort Retention Analysis","description":"For each signup month cohort, calculate the percentage of users who returned in months 1, 2, and 3 after signup.","schema":"TABLE signups (user_id INT PK, signup_date DATE)\nTABLE activity (user_id INT, activity_date DATE)","setupSql":"DROP TABLE IF EXISTS activity;DROP TABLE IF EXISTS signups;CREATE TABLE signups(user_id INT PRIMARY KEY,signup_date DATE);CREATE TABLE activity(user_id INT,activity_date DATE);INSERT INTO signups VALUES(1,'2023-01-05'),(2,'2023-01-10'),(3,'2023-01-15'),(4,'2023-01-20'),(5,'2023-01-25'),(6,'2023-02-01'),(7,'2023-02-10'),(8,'2023-02-15'),(9,'2023-02-20'),(10,'2023-02-25'),(11,'2023-03-05'),(12,'2023-03-10'),(13,'2023-03-15'),(14,'2023-03-20'),(15,'2023-03-25');INSERT INTO activity VALUES(1,'2023-02-05'),(1,'2023-03-10'),(1,'2023-04-15'),(2,'2023-02-12'),(2,'2023-03-18'),(3,'2023-02-20'),(4,'2023-03-01'),(5,'2023-02-28'),(5,'2023-03-15'),(5,'2023-04-20'),(6,'2023-03-05'),(6,'2023-04-10'),(6,'2023-05-15'),(7,'2023-03-12'),(7,'2023-04-18'),(8,'2023-03-20'),(9,'2023-04-01'),(10,'2023-03-28'),(10,'2023-04-25'),(10,'2023-05-30'),(11,'2023-04-08'),(11,'2023-05-12'),(11,'2023-06-15'),(12,'2023-04-15'),(13,'2023-05-01'),(14,'2023-04-22'),(14,'2023-05-28');","solutionSql":"WITH cohort AS (SELECT user_id, DATE_TRUNC('month', signup_date)::date AS cohort_month FROM signups), monthly_activity AS (SELECT DISTINCT user_id, DATE_TRUNC('month', activity_date)::date AS activity_month FROM activity), retention AS (SELECT c.cohort_month, (EXTRACT(YEAR FROM m.activity_month) - EXTRACT(YEAR FROM c.cohort_month)) * 12 + EXTRACT(MONTH FROM m.activity_month) - EXTRACT(MONTH FROM c.cohort_month) AS month_number, COUNT(DISTINCT c.user_id) AS retained FROM cohort c JOIN monthly_activity m ON c.user_id = m.user_id GROUP BY c.cohort_month, month_number), cohort_sizes AS (SELECT cohort_month, COUNT(*) AS cohort_size FROM cohort GROUP BY cohort_month) SELECT r.cohort_month, r.month_number, r.retained, cs.cohort_size, ROUND(100.0 * r.retained / cs.cohort_size, 2) AS retention_pct FROM retention r JOIN cohort_sizes cs ON r.cohort_month = cs.cohort_month WHERE r.month_number BETWEEN 1 AND 3 ORDER BY r.cohort_month, r.month_number;","company":"Meta","topic":"Window Functions","hints":["Assign each user to their signup month cohort using DATE_TRUNC.","Calculate month_number as the offset between activity month and cohort month.","Divide retained users by cohort size for retention percentage."]},
  {"id":"q59","difficulty":"Hard","title":"Recursive CTE: Org Chart","description":"Given an employees table with manager_id, use a recursive CTE to build the full org chart showing each employee level in the hierarchy.","schema":"TABLE org (emp_id INT PK, emp_name VARCHAR, manager_id INT)","setupSql":"DROP TABLE IF EXISTS org;CREATE TABLE org(emp_id INT PRIMARY KEY,emp_name VARCHAR(50),manager_id INT);INSERT INTO org VALUES(1,'CEO',NULL),(2,'VP Engineering',1),(3,'VP Sales',1),(4,'VP Marketing',1),(5,'Dir Backend',2),(6,'Dir Frontend',2),(7,'Dir Enterprise',3),(8,'Dir SMB',3),(9,'Dir Brand',4),(10,'Sr Eng Alice',5),(11,'Sr Eng Bob',5),(12,'Eng Carol',5),(13,'Sr Eng Dave',6),(14,'Eng Eve',6),(15,'AE Frank',7),(16,'AE Grace',7),(17,'AE Hank',8),(18,'Mktg Ivy',9),(19,'Mktg Jack',9),(20,'Eng Kate',6);","solutionSql":"WITH RECURSIVE hierarchy AS (SELECT emp_id, emp_name, manager_id, 1 AS level, emp_name::text AS path FROM org WHERE manager_id IS NULL UNION ALL SELECT o.emp_id, o.emp_name, o.manager_id, h.level + 1, h.path || ' > ' || o.emp_name FROM org o JOIN hierarchy h ON o.manager_id = h.emp_id) SELECT emp_id, emp_name, level, path FROM hierarchy ORDER BY path;","company":"Google","topic":"Recursive CTE","hints":["Start with the anchor: WHERE manager_id IS NULL (the CEO/root).","Recursive member joins org to hierarchy on manager_id = emp_id.","Track the level by incrementing h.level + 1 each recursion."]},
  {"id":"q60","difficulty":"Hard","title":"Trips and Users (Cancellation Rate)","description":"Calculate the daily cancellation rate of rides for unbanned users between two dates. A trip is cancelled if its status is \"cancelled_by_driver\" or \"cancelled_by_client\".","schema":"TABLE trips (id INT PK, client_id INT, driver_id INT, status VARCHAR, request_date DATE)\nTABLE users (user_id INT PK, banned VARCHAR, role VARCHAR)","setupSql":"DROP TABLE IF EXISTS trips;DROP TABLE IF EXISTS users;CREATE TABLE users(user_id INT PRIMARY KEY,banned VARCHAR(5),role VARCHAR(10));CREATE TABLE trips(id INT PRIMARY KEY,client_id INT,driver_id INT,status VARCHAR(30),request_date DATE);INSERT INTO users VALUES(1,'No','client'),(2,'Yes','client'),(3,'No','client'),(4,'No','driver'),(5,'No','driver'),(6,'No','driver'),(7,'No','client'),(8,'No','client'),(9,'Yes','driver'),(10,'No','client');INSERT INTO trips VALUES(1,1,4,'completed','2023-10-01'),(2,2,5,'cancelled_by_driver','2023-10-01'),(3,3,6,'completed','2023-10-01'),(4,7,4,'cancelled_by_client','2023-10-01'),(5,1,5,'completed','2023-10-02'),(6,3,6,'completed','2023-10-02'),(7,7,4,'completed','2023-10-02'),(8,8,5,'cancelled_by_driver','2023-10-02'),(9,10,6,'completed','2023-10-02'),(10,1,4,'completed','2023-10-03'),(11,3,5,'cancelled_by_client','2023-10-03'),(12,7,6,'completed','2023-10-03'),(13,8,4,'completed','2023-10-03'),(14,10,5,'cancelled_by_driver','2023-10-03'),(15,1,6,'completed','2023-10-04'),(16,3,4,'completed','2023-10-04'),(17,7,5,'cancelled_by_client','2023-10-04'),(18,8,6,'completed','2023-10-04'),(19,10,4,'completed','2023-10-04'),(20,1,5,'completed','2023-10-04');","solutionSql":"SELECT t.request_date, ROUND(SUM(CASE WHEN t.status LIKE 'cancelled%' THEN 1.0 ELSE 0 END) / COUNT(*), 2) AS cancellation_rate FROM trips t JOIN users c ON t.client_id = c.user_id AND c.role = 'client' AND c.banned = 'No' JOIN users d ON t.driver_id = d.user_id AND d.role = 'driver' AND d.banned = 'No' WHERE t.request_date BETWEEN '2023-10-01' AND '2023-10-03' GROUP BY t.request_date ORDER BY t.request_date;","company":"Uber","topic":"Aggregation","hints":["Join trips to users TWICE — once for client, once for driver.","Filter out banned users in the JOIN conditions.","Use SUM(CASE WHEN status LIKE cancelled% THEN 1 ELSE 0 END) / COUNT(*) for the rate."]},
  {"id":"q61","difficulty":"Medium","title":"Tree Node Classification","description":"Classify each node in a tree as \"Root\" (no parent), \"Leaf\" (no children), or \"Inner\" (has both parent and children).","schema":"TABLE tree (id INT PK, parent_id INT)","setupSql":"DROP TABLE IF EXISTS tree;CREATE TABLE tree(id INT PRIMARY KEY,parent_id INT);INSERT INTO tree VALUES(1,NULL),(2,1),(3,1),(4,2),(5,2),(6,3),(7,3),(8,4),(9,4),(10,5),(11,6),(12,6),(13,7),(14,8),(15,8),(16,10),(17,11),(18,13),(19,14),(20,16);","solutionSql":"SELECT t.id, CASE WHEN t.parent_id IS NULL THEN 'Root' WHEN t.id NOT IN (SELECT DISTINCT parent_id FROM tree WHERE parent_id IS NOT NULL) THEN 'Leaf' ELSE 'Inner' END AS node_type FROM tree t ORDER BY t.id;","company":"Google","topic":"CASE & Logic","hints":["Root nodes have parent_id IS NULL.","Leaf nodes never appear as someone else parent_id.","Everything else is Inner — has both a parent and children."]},
  {"id":"q62","difficulty":"Easy","title":"Delete Duplicate Emails","description":"Write a DELETE statement to remove duplicate emails, keeping only the row with the smallest id for each email address. Show the remaining rows.","schema":"TABLE person (id INT PK, email VARCHAR)","setupSql":"DROP TABLE IF EXISTS person;CREATE TABLE person(id INT PRIMARY KEY,email VARCHAR(100));INSERT INTO person VALUES(1,'john@example.com'),(2,'bob@example.com'),(3,'john@example.com'),(4,'alice@example.com'),(5,'bob@example.com'),(6,'carol@example.com'),(7,'alice@example.com'),(8,'dave@example.com'),(9,'john@example.com'),(10,'eve@example.com'),(11,'bob@example.com'),(12,'frank@example.com'),(13,'carol@example.com'),(14,'grace@example.com'),(15,'dave@example.com'),(16,'alice@example.com'),(17,'hank@example.com'),(18,'eve@example.com'),(19,'frank@example.com'),(20,'ivy@example.com');","solutionSql":"DELETE FROM person WHERE id NOT IN (SELECT MIN(id) FROM person GROUP BY email); SELECT * FROM person ORDER BY id;","company":"Meta","topic":"DML","hints":["Find the minimum id per email: SELECT MIN(id) FROM person GROUP BY email.","DELETE rows whose id is NOT IN that set.","This is a DML question — you are modifying data, not just querying."]},
  {"id":"q63","difficulty":"Medium","title":"Friend Request Acceptance Rate","description":"Calculate the overall acceptance rate of friend requests as a percentage.","schema":"TABLE friend_request (sender_id INT, send_to_id INT, request_date DATE)\nTABLE request_accepted (requester_id INT, accepter_id INT, accept_date DATE)","setupSql":"DROP TABLE IF EXISTS friend_request;DROP TABLE IF EXISTS request_accepted;CREATE TABLE friend_request(sender_id INT,send_to_id INT,request_date DATE);CREATE TABLE request_accepted(requester_id INT,accepter_id INT,accept_date DATE);INSERT INTO friend_request VALUES(1,2,'2023-01-01'),(1,3,'2023-01-02'),(2,3,'2023-01-03'),(3,4,'2023-01-04'),(4,5,'2023-01-05'),(5,6,'2023-01-06'),(6,7,'2023-01-07'),(7,8,'2023-01-08'),(8,9,'2023-01-09'),(9,10,'2023-01-10'),(10,1,'2023-01-11'),(2,5,'2023-01-12'),(3,6,'2023-01-13'),(4,7,'2023-01-14'),(5,8,'2023-01-15'),(6,9,'2023-01-16'),(7,10,'2023-01-17'),(8,1,'2023-01-18'),(9,2,'2023-01-19'),(10,3,'2023-01-20');INSERT INTO request_accepted VALUES(1,2,'2023-01-02'),(2,3,'2023-01-04'),(3,4,'2023-01-05'),(5,6,'2023-01-07'),(7,8,'2023-01-09'),(9,10,'2023-01-11'),(2,5,'2023-01-13'),(4,7,'2023-01-15'),(6,9,'2023-01-17'),(8,1,'2023-01-19');","solutionSql":"SELECT ROUND(100.0 * (SELECT COUNT(DISTINCT (requester_id, accepter_id)) FROM request_accepted) / NULLIF((SELECT COUNT(DISTINCT (sender_id, send_to_id)) FROM friend_request), 0), 2) AS acceptance_rate_pct;","company":"Meta","topic":"Aggregation","hints":["Count distinct request pairs sent and distinct pairs accepted.","Acceptance rate = accepted / sent * 100.","Use NULLIF to guard against division by zero."]},
  {"id":"q64","difficulty":"Medium","title":"A/B Test Revenue Comparison","description":"Compare average revenue per user between control and treatment groups, and calculate the percentage lift.","schema":"TABLE experiment_users (user_id INT PK, test_group VARCHAR)\nTABLE purchases (user_id INT, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS purchases;DROP TABLE IF EXISTS experiment_users;CREATE TABLE experiment_users(user_id INT PRIMARY KEY,test_group VARCHAR(20));CREATE TABLE purchases(user_id INT,amount DECIMAL(10,2));INSERT INTO experiment_users VALUES(1,'control'),(2,'control'),(3,'control'),(4,'control'),(5,'control'),(6,'control'),(7,'control'),(8,'control'),(9,'control'),(10,'control'),(11,'treatment'),(12,'treatment'),(13,'treatment'),(14,'treatment'),(15,'treatment'),(16,'treatment'),(17,'treatment'),(18,'treatment'),(19,'treatment'),(20,'treatment');INSERT INTO purchases VALUES(1,50),(1,30),(2,100),(3,75),(4,0),(5,60),(6,45),(7,80),(8,0),(9,55),(10,70),(11,90),(11,40),(12,110),(13,85),(14,120),(15,0),(16,95),(17,70),(18,130),(19,60),(20,105);","solutionSql":"WITH group_metrics AS (SELECT e.test_group, COUNT(DISTINCT e.user_id) AS users, COALESCE(SUM(p.amount), 0) AS total_rev, ROUND(COALESCE(SUM(p.amount), 0) / COUNT(DISTINCT e.user_id), 2) AS arpu FROM experiment_users e LEFT JOIN purchases p ON e.user_id = p.user_id GROUP BY e.test_group) SELECT *, ROUND(100.0 * (MAX(arpu) OVER() - MIN(arpu) OVER()) / NULLIF(MIN(arpu) OVER(), 0), 2) AS lift_pct FROM group_metrics ORDER BY test_group;","company":"Meta","topic":"Joins","hints":["LEFT JOIN to include users with zero purchases.","Calculate ARPU = total_revenue / distinct_users per group.","Lift = (treatment_arpu - control_arpu) / control_arpu * 100."]},
  {"id":"q65","difficulty":"Medium","title":"Unpivot: Wide to Long","description":"Transform a wide-format quarterly revenue table into a long-format table with one row per company per quarter.","schema":"TABLE quarterly_revenue (company VARCHAR, q1 DECIMAL, q2 DECIMAL, q3 DECIMAL, q4 DECIMAL)","setupSql":"DROP TABLE IF EXISTS quarterly_revenue;CREATE TABLE quarterly_revenue(company VARCHAR(50),q1 DECIMAL(10,2),q2 DECIMAL(10,2),q3 DECIMAL(10,2),q4 DECIMAL(10,2));INSERT INTO quarterly_revenue VALUES('Apple',90000,95000,88000,110000),('Google',75000,80000,82000,90000),('Amazon',120000,115000,130000,140000),('Meta',60000,58000,62000,65000),('Microsoft',85000,88000,91000,95000);","solutionSql":"SELECT company, 'Q1' AS quarter, q1 AS revenue FROM quarterly_revenue UNION ALL SELECT company, 'Q2', q2 FROM quarterly_revenue UNION ALL SELECT company, 'Q3', q3 FROM quarterly_revenue UNION ALL SELECT company, 'Q4', q4 FROM quarterly_revenue ORDER BY company, quarter;","company":"Google","topic":"CASE & Logic","hints":["Unpivot = convert columns to rows.","Use UNION ALL — one SELECT per column you want to unpivot.","Each SELECT maps a specific column (q1, q2, etc.) to a generic \"quarter\" + \"revenue\" pair."]},
  {"id":"q66","difficulty":"Hard","title":"Human Traffic of Stadium","description":"Find groups of 3 or more consecutive rows where the visitor count is 100 or more. Return all rows belonging to such groups.","schema":"TABLE stadium (id INT PK, visit_date DATE, visitors INT)","setupSql":"DROP TABLE IF EXISTS stadium;CREATE TABLE stadium(id INT PRIMARY KEY,visit_date DATE,visitors INT);INSERT INTO stadium VALUES(1,'2023-01-01',10),(2,'2023-01-02',109),(3,'2023-01-03',150),(4,'2023-01-04',99),(5,'2023-01-05',145),(6,'2023-01-06',1455),(7,'2023-01-07',199),(8,'2023-01-08',188),(9,'2023-01-09',50),(10,'2023-01-10',120),(11,'2023-01-11',130),(12,'2023-01-12',140),(13,'2023-01-13',90),(14,'2023-01-14',200),(15,'2023-01-15',210),(16,'2023-01-16',220),(17,'2023-01-17',230),(18,'2023-01-18',80),(19,'2023-01-19',300),(20,'2023-01-20',50);","solutionSql":"WITH high_traffic AS (SELECT id, visit_date, visitors, id - ROW_NUMBER() OVER(ORDER BY id) AS grp FROM stadium WHERE visitors >= 100), sized AS (SELECT id, visit_date, visitors, grp, COUNT(*) OVER(PARTITION BY grp) AS grp_size FROM high_traffic) SELECT id, visit_date, visitors FROM sized WHERE grp_size >= 3 ORDER BY id;","company":"Uber","topic":"Window Functions","hints":["Filter for rows with visitors >= 100.","Use the islands-and-gaps trick: id - ROW_NUMBER() gives a constant for consecutive rows.","Keep only groups with COUNT(*) >= 3."]},
  {"id":"q67","difficulty":"Hard","title":"Recursive CTE: Date Series","description":"Generate a complete date series for the month and LEFT JOIN to sales to show daily totals (0 for days with no sales). No generate_series allowed.","schema":"TABLE daily_sales (sale_date DATE, amount DECIMAL)","setupSql":"DROP TABLE IF EXISTS daily_sales;CREATE TABLE daily_sales(sale_date DATE,amount DECIMAL(10,2));INSERT INTO daily_sales VALUES('2023-06-01',500),('2023-06-03',750),('2023-06-04',300),('2023-06-06',1200),('2023-06-10',800),('2023-06-11',450),('2023-06-15',950),('2023-06-18',600),('2023-06-20',1100),('2023-06-21',700),('2023-06-22',850),('2023-06-25',400),('2023-06-28',1300),('2023-06-30',550);","solutionSql":"WITH RECURSIVE date_series AS (SELECT '2023-06-01'::date AS dt UNION ALL SELECT dt + 1 FROM date_series WHERE dt < '2023-06-30') SELECT ds.dt AS sale_date, COALESCE(s.amount, 0) AS amount FROM date_series ds LEFT JOIN daily_sales s ON ds.dt = s.sale_date ORDER BY ds.dt;","company":"Amazon","topic":"Recursive CTE","hints":["Anchor: SELECT start_date. Recursive: SELECT dt + 1 WHERE dt < end_date.","This generates every date in the range without generate_series.","LEFT JOIN the generated dates to sales; COALESCE fills gaps with 0."]}
];
