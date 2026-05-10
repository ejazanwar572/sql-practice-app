export interface Question {
  id: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  title: string;
  description: string;
  schema: string;
  setupSql: string;
  solutionSql: string;
}

export const questions: Question[] = [
  {
    id: 'q1',
    difficulty: 'Easy',
    title: 'Compute cumulative revenue per day',
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
      ('2023-01-01', 100),
      ('2023-01-01', 150),
      ('2023-01-02', 200),
      ('2023-01-03', 50),
      ('2023-01-03', 300);
    `,
    solutionSql: `SELECT 
  order_date, 
  SUM(revenue) AS daily_revenue, 
  SUM(SUM(revenue)) OVER (ORDER BY order_date) AS cumulative_revenue 
FROM sales 
GROUP BY order_date 
ORDER BY order_date;`
  },
  {
    id: 'q2',
    difficulty: 'Easy',
    title: 'Detect and delete duplicate records',
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
      (5, 103, '2023-01-02 09:00:00', 100); -- Duplicate
    `,
    solutionSql: `WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY user_id, txn_time, amount ORDER BY id) AS rn
  FROM transactions
)
DELETE FROM transactions 
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);
-- To verify, run: SELECT * FROM transactions ORDER BY id;`
  },
  {
    id: 'q3',
    difficulty: 'Easy',
    title: 'Rank products by sales per year',
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
      (3, '2023-09-11', 600);
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
FROM yearly_sales;`
  },
  {
    id: 'q4',
    difficulty: 'Easy',
    title: 'First and last transaction on same day',
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
      (3, '2023-05-10 14:00:00');
    `,
    solutionSql: `SELECT customer_id
FROM customer_txns
GROUP BY customer_id
HAVING DATE(MIN(transaction_date)) = DATE(MAX(transaction_date));`
  }
];
