const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "todoApplication.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () =>
      console.log("Server Running at http://localhost:3000/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasCategoryAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.status !== undefined
  );
};
const hasCategoryAndPriorityProperties = (requestQuery) => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

const hasCategoryProperty = (requestQuery) => {
  return requestQuery.category !== undefined;
};

app.get("/todos/", async (request, response) => {
  let data = null;
  let getTodoQuery = "";
  const { search_q = "", priority, status, category, dueDate } = request.query;

  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodoQuery = `
          SELECT
            *
          FROM
            todo
          WHERE
            todo LIKE '%${search_q}%'
            AND priority='${priority}'
            AND status='${status}';`;

      break;
    case hasCategoryAndStatusProperties(request.query):
      getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}'
              AND category='${category}'
              AND status='${status}';  `;
      break;
    case hasCategoryAndPriorityProperties(request.query):
      getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}'
              AND category='${category}'
              AND priority='${priority}';  `;
      break;
    case hasPriorityProperty(request.query):
      getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}'
              AND priority='${priority}';  `;
      break;
    case hasCategoryProperty(request.query):
      getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}'
              AND category='${category}';  `;
      break;
    case hasStatusProperty(request.query):
      getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              todo LIKE '%${search_q}'
              AND status='${status}';  `;
      break;
    default:
      getTodosQuery = `
      SELECT
        *
      FROM
        todo 
      WHERE
        todo LIKE '%${search_q}%';`;
  }
  data = await database.all(getTodoQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;

  const getTodoQuery = `
            SELECT
              *
            FROM
              todo
            WHERE
              id=${todoId};  `;
  const getTodo = await database.get(getTodoQuery);
  response.send(getTodo);
});

module.exports = app;
