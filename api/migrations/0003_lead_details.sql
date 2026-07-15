-- Бриф v3: контакт запрашиваем после показа результата, ответы и сводку
-- храним рядом с заявкой. Отдельная таблица, потому что раннер миграций
-- выполняет все файлы при каждом старте и ALTER TABLE не идемпотентен.
CREATE TABLE IF NOT EXISTS lead_details (
  lead_id INTEGER PRIMARY KEY REFERENCES leads(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT '',
  contact TEXT NOT NULL DEFAULT '',
  comment TEXT NOT NULL DEFAULT '',
  answers_json TEXT NOT NULL DEFAULT '{}',
  summary TEXT NOT NULL DEFAULT ''
);
