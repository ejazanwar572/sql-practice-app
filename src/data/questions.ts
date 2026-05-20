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
    hints: [
      'Aggregate customer spending using SUM() and GROUP BY customer_id.',
      'Use SUM() OVER(ORDER BY ... DESC) to compute the running total of spending from largest to smallest.',
      'Compare this running total to 80% of the grand total (which can be calculated using SUM() OVER()).'
    ]
  }
];

