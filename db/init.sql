CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income','expense')),
  amount_cents INT NOT NULL CHECK (amount_cents > 0),
  category TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL
);
